import 'package:flutter/material.dart';
import 'package:latticechat/logic/models/user.dart';
import 'package:latticechat/logic/services/api.dart';
import 'package:latticechat/logic/util/error.dart';
import 'package:latticechat/pages/friend_requests.dart';
import 'open_chat.dart';

class ChatListPage extends StatefulWidget {
  final String jwt;

  const ChatListPage({
    super.key,
    required this.jwt,
  });

  @override
  State<ChatListPage> createState() => _ChatListPageState();
}

class _ChatListPageState extends State<ChatListPage> {
  final _conversationApi = ApiServices.getConversationServices();
  final _userApi = ApiServices.getUserServices();

  UserModel? _currentUser;
  late Future<List<Map<String, dynamic>>> _conversationsFuture;

  @override
  void initState() {
    super.initState();
    _conversationsFuture = _initializeData();
  }

  Future<List<Map<String, dynamic>>> _initializeData() async {
    final userResponse = await _userApi.fetchUser(widget.jwt);
    final user = _extractCurrentUser(userResponse);

    if (user == null) {
      throw ApiError(
        type: 'missing_user',
        message: 'Failed to load current user.',
      );
    }

    _currentUser = user;

    final response = await _conversationApi.fetchConversations(widget.jwt);
    return _normalizeMapList(response.conversations);
  }

  List<Map<String, dynamic>> _normalizeMapList(dynamic raw) {
    if (raw is Iterable) {
      return raw
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    }
    return [];
  }

  UserModel? _extractCurrentUser(dynamic response) {
    try {
      final dynamic candidate =
          response.user ??
              response.currentUser ??
              response.userInfo ??
              response.basicUserInfo;

      if (candidate is UserModel) {
        return candidate;
      }

      if (candidate is Map) {
        return UserModel.fromJson(Map<String, dynamic>.from(candidate));
      }
    } catch (_) {}

    try {
      final dynamic rawJson = response.toJson();
      if (rawJson is Map<String, dynamic>) {
        if (rawJson['user'] is Map) {
          return UserModel.fromJson(rawJson);
        }
        if (rawJson['currentUser'] is Map) {
          return UserModel.fromJson({
            'user': rawJson['currentUser'],
          });
        }
        if (rawJson['userInfo'] is Map) {
          return UserModel.fromJson({
            'user': rawJson['userInfo'],
          });
        }
        if (rawJson['basicUserInfo'] is Map) {
          return UserModel.fromJson(rawJson['basicUserInfo']);
        }
      }
    } catch (_) {}

    return null;
  }

  Future<void> _refreshConversations() async {
    setState(() {
      _conversationsFuture = _initializeData();
    });
    await _conversationsFuture;
  }

  String _conversationTitle(Map<String, dynamic> conversation) {
    final currentUser = _currentUser;
    final name = conversation['name'];
    if (name is String && name.trim().isNotEmpty) {
      return name;
    }

    final members = conversation['members'];
    if (members is List && currentUser != null) {
      final otherNames = members
          .whereType<Map>()
          .map((member) => Map<String, dynamic>.from(member))
          .where(
            (member) =>
        (member['id'] ?? member['_id'] ?? '').toString() !=
            currentUser.id,
      )
          .map(
            (member) =>
            (member['username'] ?? member['name'] ?? 'Unknown').toString(),
      )
          .where((name) => name.trim().isNotEmpty)
          .toList();

      if (otherNames.isNotEmpty) {
        return otherNames.join(', ');
      }
    }

    return 'Conversation';
  }

  String _lastMessageText(Map<String, dynamic> conversation) {
    final lastMessage = conversation['lastMessage'];
    if (lastMessage is String && lastMessage.trim().isNotEmpty) {
      return lastMessage;
    }

    if (lastMessage is Map<String, dynamic>) {
      final content = lastMessage['content'];
      if (content is String && content.trim().isNotEmpty) {
        return content;
      }
    }

    final messages = conversation['messages'];
    if (messages is List && messages.isNotEmpty) {
      final last = messages.last;
      if (last is Map<String, dynamic>) {
        final content = last['content'];
        if (content is String && content.trim().isNotEmpty) {
          return content;
        }
      }
    }

    return 'No messages yet';
  }

  String _timeLabel(Map<String, dynamic> conversation) {
    final raw =
        conversation['updatedAt'] ??
            conversation['lastMessageAt'] ??
            conversation['createdAt'];

    if (raw == null) return '';

    final parsed = DateTime.tryParse(raw.toString());
    if (parsed == null) return '';

    final local = parsed.toLocal();
    final now = DateTime.now();

    final sameDay =
        local.year == now.year &&
            local.month == now.month &&
            local.day == now.day;

    if (sameDay) {
      final hour = local.hour % 12 == 0 ? 12 : local.hour % 12;
      final minute = local.minute.toString().padLeft(2, '0');
      final suffix = local.hour >= 12 ? 'PM' : 'AM';
      return '$hour:$minute $suffix';
    }

    return '${local.month}/${local.day}/${local.year}';
  }

  String _conversationId(Map<String, dynamic> conversation) {
    return (conversation['id'] ?? conversation['_id'] ?? '').toString();
  }

  Future<void> _openAddFriendDialog() async {
    final currentUser = _currentUser;
    if (currentUser == null) return;

    final sent = await showDialog<bool>(
      context: context,
      builder: (context) => AddFriendDialog(
        currentUser: currentUser,
        jwt: widget.jwt,
      ),
    );

    if (sent == true && mounted) {
      await _refreshConversations();
    }
  }

  Future<void> _openFriendRequestsPage() async {
    final currentUser = _currentUser;
    if (currentUser == null) return;

    final changed = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (context) => FriendRequestsPage(
          currentUser: currentUser,
          jwt: widget.jwt,
        ),
      ),
    );

    if (changed == true && mounted) {
      await _refreshConversations();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.group_add),
            onPressed: _openFriendRequestsPage,
          ),
          IconButton(
            icon: const Icon(Icons.person_add_alt_1),
            onPressed: _openAddFriendDialog,
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _conversationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            String message = 'Failed to load conversations.';
            final error = snapshot.error;
            if (error is ApiError) {
              message = error.message;
            }

            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(message, textAlign: TextAlign.center),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _refreshConversations,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          final conversations = snapshot.data ?? [];

          if (conversations.isEmpty) {
            return RefreshIndicator(
              onRefresh: _refreshConversations,
              child: ListView(
                children: const [
                  SizedBox(height: 220),
                  Center(child: Text('No conversations yet.')),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _refreshConversations,
            child: ListView.separated(
              itemCount: conversations.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final currentUser = _currentUser;
                if (currentUser == null) {
                  return const SizedBox.shrink();
                }

                final conversation = conversations[index];
                final title = _conversationTitle(conversation);
                final lastMessage = _lastMessageText(conversation);
                final time = _timeLabel(conversation);
                final conversationId = _conversationId(conversation);

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  leading: CircleAvatar(
                    radius: 24,
                    child: Text(
                      title.isNotEmpty ? title[0].toUpperCase() : '?',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                  title: Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      lastMessage,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  trailing: Text(
                    time,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => OpenChatPage(
                          otherUserName: title,
                          conversationId: conversationId,
                          currentUser: currentUser,
                          jwt: widget.jwt,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class AddFriendDialog extends StatefulWidget {
  final UserModel currentUser;
  final String jwt;

  const AddFriendDialog({
    super.key,
    required this.currentUser,
    required this.jwt,
  });

  @override
  State<AddFriendDialog> createState() => _AddFriendDialogState();
}

class _AddFriendDialogState extends State<AddFriendDialog> {
  final _userApi = ApiServices.getUserServices();
  final TextEditingController _controller = TextEditingController();

  bool _isSearching = false;
  bool _isSending = false;
  bool _requestSent = false;
  String? _statusMessage;
  String? _foundUserId;
  String? _foundUsername;

  Future<void> _findUser() async {
    final username = _controller.text.trim();

    if (username.isEmpty) {
      setState(() {
        _statusMessage = 'Enter a username.';
        _foundUserId = null;
        _foundUsername = null;
        _requestSent = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _statusMessage = null;
      _foundUserId = null;
      _foundUsername = null;
      _requestSent = false;
    });

    try {
      final dynamic response = await _userApi.fetchBasicUserByName(username);

      // DEBUG: see exactly what came back from the API response object
      try {
        print('fetchBasicUserByName response.toJson(): ${response.toJson()}');
      } catch (_) {
        print('fetchBasicUserByName response: $response');
      }

      final user = _extractBasicUser(response);

      if (!mounted) return;

      if (user == null) {
        setState(() {
          _statusMessage = 'Could not read user info.';
          _foundUserId = null;
          _foundUsername = null;
        });
        return;
      }

      if (user.id == widget.currentUser.id) {
        setState(() {
          _foundUserId = null;
          _foundUsername = null;
          _statusMessage = 'You cannot add yourself.';
        });
        return;
      }

      setState(() {
        _foundUserId = user.id;
        _foundUsername = user.username;
        _statusMessage = 'User found: ${user.username}';
      });
    } on ApiError catch (e) {
      if (!mounted) return;

      setState(() {
        _statusMessage = e.message;
        _foundUserId = null;
        _foundUsername = null;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        _statusMessage = 'This user does not exist.';
        _foundUserId = null;
        _foundUsername = null;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSearching = false;
        });
      }
    }
  }

  Future<void> _sendFriendRequest() async {
    if (_foundUserId == null || _requestSent) return;

    if (_foundUserId == widget.currentUser.id) {
      setState(() {
        _statusMessage = 'You cannot add yourself.';
      });
      return;
    }

    setState(() {
      _isSending = true;
      _statusMessage = null;
    });

    try {
      await _userApi.sendFriendRequest(widget.jwt, _foundUserId!);

      if (!mounted) return;

      setState(() {
        _requestSent = true;
        _statusMessage = 'Friend request sent to $_foundUsername.';
      });

      Navigator.pop(context, true);
    } on ApiError catch (e) {
      if (!mounted) return;

      setState(() {
        _statusMessage = e.message;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        _statusMessage = 'Failed to send friend request.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSending = false;
        });
      }
    }
  }

  BasicUserModel? _extractBasicUser(dynamic response) {
    try {
      final dynamic candidate =
          response.basicUserInfo ?? response.user ?? response.userInfo;

      if (candidate is BasicUserModel) {
        return candidate;
      }

      if (candidate is Map) {
        return BasicUserModel.fromJson(Map<String, dynamic>.from(candidate));
      }
    } catch (_) {}

    try {
      final dynamic rawJson = response.toJson();

      if (rawJson is Map<String, dynamic>) {
        if (rawJson['basicUserInfo'] is Map) {
          return BasicUserModel.fromJson(
            Map<String, dynamic>.from(rawJson['basicUserInfo']),
          );
        }

        if (rawJson['user'] is Map) {
          return BasicUserModel.fromJson(
            Map<String, dynamic>.from(rawJson['user']),
          );
        }

        if (rawJson['userInfo'] is Map) {
          return BasicUserModel.fromJson(
            Map<String, dynamic>.from(rawJson['userInfo']),
          );
        }

        if ((rawJson['id'] != null || rawJson['_id'] != null) &&
            (rawJson['username'] != null || rawJson['name'] != null)) {
          return BasicUserModel.fromJson(rawJson);
        }
      }
    } catch (_) {}

    return null;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Friend'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _controller,
            decoration: const InputDecoration(
              labelText: 'Username',
              hintText: 'Enter username',
            ),
            onSubmitted: (_) => _findUser(),
          ),
          const SizedBox(height: 12),
          if (_statusMessage != null)
            Align(
              alignment: Alignment.centerLeft,
              child: Text(_statusMessage!),
            ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _isSearching || _isSending
              ? null
              : () => Navigator.pop(context, false),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: _isSearching || _requestSent ? null : _findUser,
          child: _isSearching
              ? const SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          )
              : const Text('Find'),
        ),
        ElevatedButton(
          onPressed: (_foundUserId != null && !_isSending && !_requestSent)
              ? _sendFriendRequest
              : null,
          child: _isSending
              ? const SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          )
              : Text(_requestSent ? 'Sent' : 'Add'),
        ),
      ],
    );
  }
}