import 'package:flutter/material.dart';
import 'package:latticechat/logic/models/conversation.dart';
import 'package:latticechat/logic/models/user.dart';
import 'package:latticechat/logic/services/api.dart';
import 'package:latticechat/logic/util/error.dart';
import 'package:latticechat/pages/account.dart';
import 'package:latticechat/pages/friend_requests.dart';
import 'package:latticechat/theme.dart';
import 'package:latticechat/utils/severity.dart';
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
    final conversations = _normalizeConversationList(response.conversations);
    return _mergeFriendsIntoConversationList(user, conversations);
  }

  List<Map<String, dynamic>> _normalizeConversationList(dynamic raw) {
    if (raw is Iterable) {
      return raw.map((item) {
        if (item is Map<String, dynamic>) {
          return Map<String, dynamic>.from(item);
        }

        if (item is Map) {
          return Map<String, dynamic>.from(item);
        }

        if (item is ConversationModel) {
          return {
            'id': item.id,
            'name': item.name,
            'isDirectMessage': item.isDirectMessage,
            'ownerId': item.ownerId,
            'members': item.members
                .map((member) => {
              'id': member.id,
              'username': member.username,
              'createdAt': member.createdAt.toIso8601String(),
            })
                .toList(),
          };
        }

        return <String, dynamic>{};
      }).where((item) => item.isNotEmpty).toList();
    }

    return [];
  }

  List<Map<String, dynamic>> _mergeFriendsIntoConversationList(
      UserModel user,
      List<Map<String, dynamic>> conversations,
      ) {
    final merged = List<Map<String, dynamic>>.from(conversations);
    final existingFriendIds = <String>{};

    for (final conversation in conversations) {
      final members = conversation['members'];
      if (members is List) {
        for (final member in members) {
          if (member is Map) {
            final id = (member['id'] ?? member['_id'] ?? '').toString();
            if (id.isNotEmpty && id != user.id) {
              existingFriendIds.add(id);
            }
          }
        }
      }
    }

    for (final friend in user.friends) {
      if (existingFriendIds.contains(friend.id)) {
        continue;
      }

      merged.add({
        'id': '',
        'name': '',
        'isDirectMessage': true,
        'createdAt': friend.createdAt.toIso8601String(),
        'updatedAt': friend.createdAt.toIso8601String(),
        'members': [
          {
            'id': user.id,
            'username': user.username,
            'createdAt': user.createdAt.toIso8601String(),
          },
          {
            'id': friend.id,
            'username': friend.username,
            'createdAt': friend.createdAt.toIso8601String(),
          },
        ],
        'friendId': friend.id,
        'friendUsername': friend.username,
        'placeholder': true,
      });
    }

    merged.sort((a, b) {
      final aDate = _parseDate(
        a['updatedAt'] ?? a['lastMessageAt'] ?? a['createdAt'],
      );
      final bDate = _parseDate(
        b['updatedAt'] ?? b['lastMessageAt'] ?? b['createdAt'],
      );

      if (aDate == null && bDate == null) return 0;
      if (aDate == null) return 1;
      if (bDate == null) return -1;
      return bDate.compareTo(aDate);
    });

    return merged;
  }

  DateTime? _parseDate(dynamic raw) {
    if (raw == null) return null;
    if (raw is DateTime) return raw;
    return DateTime.tryParse(raw.toString());
  }

  UserModel? _extractCurrentUser(dynamic response) {
    try {
      final dynamic candidate =
          response.user ?? response.currentUser ?? response.userInfo ?? response.basicUserInfo;

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

    final friendUsername = conversation['friendUsername'];
    if (friendUsername is String && friendUsername.trim().isNotEmpty) {
      return friendUsername;
    }

    final members = conversation['members'];
    if (members is List && currentUser != null) {
      final otherNames = members
          .whereType<Map>()
          .map((member) => Map<String, dynamic>.from(member))
          .where(
            (member) => (member['id'] ?? member['_id'] ?? '').toString() != currentUser.id,
      )
          .map((member) => (member['username'] ?? member['name'] ?? 'Unknown').toString())
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

    if (lastMessage is Map) {
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
      if (last is Map) {
        final content = last['content'];
        if (content is String && content.trim().isNotEmpty) {
          return content;
        }
      }
    }

    return 'No messages yet';
  }

  String _timeLabel(Map<String, dynamic> conversation) {
    final raw = conversation['updatedAt'] ?? conversation['lastMessageAt'] ?? conversation['createdAt'];

    if (raw == null) return '';

    final parsed = DateTime.tryParse(raw.toString());
    if (parsed == null) return '';

    final local = parsed.toLocal();
    final now = DateTime.now();

    final sameDay = local.year == now.year && local.month == now.month && local.day == now.day;

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

  void _openAccountPage() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AccountPage(jsonWT: widget.jwt),
      ),
    );
  }

  Widget _buildConversationList(List<Map<String, dynamic>> conversations) {
    return ListView.separated(
      padding: EdgeInsets.zero,
      itemCount: conversations.length,
      separatorBuilder: (_, index) => Divider(
        height: 1,
        color: borderColor,
      ),
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
            vertical: 10,
          ),
          leading: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: backgroundColor,
              border: Border.all(color: borderColor),
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: Text(
              title.isNotEmpty ? title[0].toUpperCase() : '?',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          title: Text(
            title,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(
              lastMessage,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodySmall,
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
    );
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
          IconButton(
            icon: const Icon(Icons.manage_accounts_outlined),
            onPressed: _openAccountPage,
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
          child: Column(
            children: [
              primaryGradientText(context, 'Messages'),
              const SizedBox(height: 12),
              Text(
                'Continue your encrypted chats',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Expanded(
                child: FutureBuilder<List<Map<String, dynamic>>>(
                  future: _conversationsFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return Container(
                        width: double.infinity,
                        decoration: AppContainerStyles.genericBox,
                        child: const Center(
                          child: CircularProgressIndicator(),
                        ),
                      );
                    }

                    if (snapshot.hasError) {
                      String message = 'Failed to load conversations.';
                      final error = snapshot.error;
                      if (error is ApiError) {
                        message = error.message;
                      }

                      return Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: AppContainerStyles.genericBox,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              message,
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: _refreshConversations,
                              style: AppButtonStyles.primaryElevated,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      );
                    }

                    final conversations = snapshot.data ?? [];

                    return Container(
                      width: double.infinity,
                      decoration: AppContainerStyles.genericBox,
                      child: RefreshIndicator(
                        onRefresh: _refreshConversations,
                        color: primaryColor,
                        backgroundColor: foregroundColor,
                        child: conversations.isEmpty
                            ? ListView(
                          children: [
                            const SizedBox(height: 220),
                            Center(
                              child: Text(
                                'No conversations yet.',
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ),
                          ],
                        )
                            : _buildConversationList(conversations),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
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
      final response = await _userApi.fetchBasicUserByName(username);
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
    if (_foundUsername == null || _requestSent) return;

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
      await _userApi.sendFriendRequest(widget.jwt, _foundUsername!);

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
      final dynamic candidate = response.basicUserInfo ?? response.user ?? response.userInfo;

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

  Widget _buildStatus() {
    if (_statusMessage == null || _statusMessage!.trim().isEmpty) {
      return const SizedBox.shrink();
    }

    final lower = _statusMessage!.toLowerCase();
    final severity = lower.contains('sent') || lower.contains('found')
        ? Severity.none
        : lower.contains('cannot') || lower.contains('failed') || lower.contains('does not exist')
        ? Severity.critical
        : Severity.major;

    return StatusMessage(
      message: _statusMessage!,
      severity: severity,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: foregroundColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(color: borderColor),
      ),
      title: Text(
        'Add Friend',
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      content: SizedBox(
        width: 300,
        child: Column(
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
            _buildStatus(),
          ],
        ),
      ),
      actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      actions: [
        TextButton(
          onPressed: _isSearching || _isSending ? null : () => Navigator.pop(context, false),
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
        SizedBox(
          width: 84,
          child: ElevatedButton(
            onPressed: (_foundUsername != null && !_isSending && !_requestSent)
                ? _sendFriendRequest
                : null,
            style: AppButtonStyles.primaryElevated,
            child: _isSending
                ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
                : Text(_requestSent ? 'Sent' : 'Add'),
          ),
        ),
      ],
    );
  }
}