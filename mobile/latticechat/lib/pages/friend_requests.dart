import 'package:flutter/material.dart';
import 'package:latticechat/logic/models/user.dart';
import 'package:latticechat/logic/services/api.dart';
import 'package:latticechat/logic/util/error.dart';

class FriendRequestsPage extends StatefulWidget {
  final UserModel currentUser;
  final String jwt;

  const FriendRequestsPage({
    super.key,
    required this.currentUser,
    required this.jwt,
  });

  @override
  State<FriendRequestsPage> createState() => _FriendRequestsPageState();
}

class _FriendRequestsPageState extends State<FriendRequestsPage> {
  final _userApi = ApiServices.getUserServices();
  late Future<_FriendRequestSections> _requestsFuture;

  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  void _loadRequests() {
    _requestsFuture = _fetchRequests();
  }

  Future<_FriendRequestSections> _fetchRequests() async {
    final response = await _userApi.fetchFriendRequests(widget.jwt);
    final raw = response.friendRequests;

    final requests = <Map<String, dynamic>>[];
    if (raw is List) {
      requests.addAll(
        raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)),
      );
    }

    final incoming = <Map<String, dynamic>>[];
    final outgoing = <Map<String, dynamic>>[];

    for (final request in requests) {
      final senderId = _extractId(
        request,
        preferredKeys: const [
          'senderId',
          'fromId',
          'requesterId',
          'sourceUserId',
          'creatorId',
          'ownerId',
          'userId',
        ],
        nestedKeys: const ['sender', 'from', 'requester', 'sourceUser', 'user'],
      );

      final receiverId = _extractId(
        request,
        preferredKeys: const [
          'receiverId',
          'targetId',
          'toId',
          'recipientId',
          'requestedId',
          'friendId',
        ],
        nestedKeys: const ['receiver', 'target', 'to', 'recipient', 'requestedUser', 'friend'],
      );

      if (receiverId == widget.currentUser.id) {
        incoming.add(request);
        continue;
      }

      if (senderId == widget.currentUser.id) {
        outgoing.add(request);
        continue;
      }

      final fallbackId = _extractId(
        request,
        preferredKeys: const ['id', '_id'],
        nestedKeys: const ['user'],
      );

      if (fallbackId.isNotEmpty && fallbackId != widget.currentUser.id) {
        incoming.add(request);
      }
    }

    return _FriendRequestSections(
      incoming: incoming,
      outgoing: outgoing,
    );
  }

  Future<void> _refreshRequests() async {
    setState(() {
      _loadRequests();
    });
    await _requestsFuture;
  }

  String _extractId(
      Map<String, dynamic> request, {
        List<String> preferredKeys = const [],
        List<String> nestedKeys = const [],
      }) {
    for (final key in preferredKeys) {
      final value = request[key];
      if (value != null && value.toString().trim().isNotEmpty) {
        return value.toString();
      }
    }

    for (final key in nestedKeys) {
      final nested = request[key];
      if (nested is Map) {
        final map = Map<String, dynamic>.from(nested);
        final value = map['id'] ?? map['_id'];
        if (value != null && value.toString().trim().isNotEmpty) {
          return value.toString();
        }
      }
    }

    final user = request['user'];
    if (user is Map) {
      final map = Map<String, dynamic>.from(user);
      final value = map['id'] ?? map['_id'];
      if (value != null && value.toString().trim().isNotEmpty) {
        return value.toString();
      }
    }

    return '';
  }

  String _extractUsername(
      Map<String, dynamic> request, {
        List<String> preferredKeys = const [],
        List<String> nestedKeys = const [],
      }) {
    for (final key in preferredKeys) {
      final value = request[key];
      if (value != null && value.toString().trim().isNotEmpty) {
        return value.toString();
      }
    }

    for (final key in nestedKeys) {
      final nested = request[key];
      if (nested is Map) {
        final map = Map<String, dynamic>.from(nested);
        final value = map['username'] ?? map['name'];
        if (value != null && value.toString().trim().isNotEmpty) {
          return value.toString();
        }
      }
    }

    final user = request['user'];
    if (user is Map) {
      final map = Map<String, dynamic>.from(user);
      final value = map['username'] ?? map['name'];
      if (value != null && value.toString().trim().isNotEmpty) {
        return value.toString();
      }
    }

    final fallback = request['username'] ?? request['name'];
    if (fallback != null && fallback.toString().trim().isNotEmpty) {
      return fallback.toString();
    }

    return 'Unknown User';
  }

  String _incomingUserId(Map<String, dynamic> request) {
    return _extractId(
      request,
      preferredKeys: const [
        'senderId',
        'fromId',
        'requesterId',
        'sourceUserId',
        'creatorId',
        'ownerId',
        'userId',
        'id',
        '_id',
      ],
      nestedKeys: const ['sender', 'from', 'requester', 'sourceUser', 'user'],
    );
  }

  String _incomingUsername(Map<String, dynamic> request) {
    return _extractUsername(
      request,
      preferredKeys: const ['senderUsername', 'fromUsername', 'requesterUsername', 'username', 'name'],
      nestedKeys: const ['sender', 'from', 'requester', 'sourceUser', 'user'],
    );
  }

  String _outgoingUserId(Map<String, dynamic> request) {
    return _extractId(
      request,
      preferredKeys: const [
        'receiverId',
        'targetId',
        'toId',
        'recipientId',
        'requestedId',
        'friendId',
        'id',
        '_id',
      ],
      nestedKeys: const ['receiver', 'target', 'to', 'recipient', 'requestedUser', 'friend', 'user'],
    );
  }

  String _outgoingUsername(Map<String, dynamic> request) {
    return _extractUsername(
      request,
      preferredKeys: const ['receiverUsername', 'targetUsername', 'toUsername', 'recipientUsername', 'username', 'name'],
      nestedKeys: const ['receiver', 'target', 'to', 'recipient', 'requestedUser', 'friend', 'user'],
    );
  }

  Future<void> _acceptRequest(Map<String, dynamic> request) async {
    final targetId = _incomingUserId(request);
    final username = _incomingUsername(request);

    if (targetId.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to accept friend request.')),
      );
      return;
    }

    try {
      await _userApi.acceptFriendRequest(widget.jwt, targetId);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('You are now friends with $username.')),
      );

      await _refreshRequests();
      Navigator.pop(context, true);
    } on ApiError catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message)),
      );
    } catch (_) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to accept friend request.')),
      );
    }
  }

  Future<void> _declineIncomingRequest(Map<String, dynamic> request) async {
    final targetId = _incomingUserId(request);
    final username = _incomingUsername(request);

    if (targetId.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to decline friend request.')),
      );
      return;
    }

    try {
      await _userApi.removeFriendRequest(widget.jwt, targetId);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Declined request from $username.')),
      );

      await _refreshRequests();
    } on ApiError catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message)),
      );
    } catch (_) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to decline friend request.')),
      );
    }
  }

  Future<void> _cancelOutgoingRequest(Map<String, dynamic> request) async {
    final targetId = _outgoingUserId(request);
    final username = _outgoingUsername(request);

    if (targetId.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to cancel friend request.')),
      );
      return;
    }

    try {
      await _userApi.removeFriendRequest(widget.jwt, targetId);

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Canceled request to $username.')),
      );

      await _refreshRequests();
    } on ApiError catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message)),
      );
    } catch (_) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to cancel friend request.')),
      );
    }
  }

  Widget _buildEmptyState(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Text(
        text,
        style: Theme.of(context).textTheme.bodyMedium,
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildIncomingTile(Map<String, dynamic> request) {
    final username = _incomingUsername(request);

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: CircleAvatar(
        radius: 24,
        child: Text(
          username.isNotEmpty ? username[0].toUpperCase() : '?',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      title: Text(
        username,
        style: const TextStyle(fontWeight: FontWeight.w600),
      ),
      subtitle: const Text('Sent you a friend request'),
      trailing: Wrap(
        spacing: 8,
        children: [
          TextButton(
            onPressed: () => _declineIncomingRequest(request),
            child: const Text('Decline'),
          ),
          ElevatedButton(
            onPressed: () => _acceptRequest(request),
            child: const Text('Accept'),
          ),
        ],
      ),
    );
  }

  Widget _buildOutgoingTile(Map<String, dynamic> request) {
    final username = _outgoingUsername(request);

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: CircleAvatar(
        radius: 24,
        child: Text(
          username.isNotEmpty ? username[0].toUpperCase() : '?',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      title: Text(
        username,
        style: const TextStyle(fontWeight: FontWeight.w600),
      ),
      subtitle: const Text('Pending'),
      trailing: TextButton(
        onPressed: () => _cancelOutgoingRequest(request),
        child: const Text('Cancel'),
      ),
    );
  }

  List<Widget> _buildSections(_FriendRequestSections sections) {
    final widgets = <Widget>[];

    widgets.add(_buildSectionHeader('Incoming'));
    if (sections.incoming.isEmpty) {
      widgets.add(_buildEmptyState('No incoming friend requests.'));
    } else {
      for (var i = 0; i < sections.incoming.length; i++) {
        widgets.add(_buildIncomingTile(sections.incoming[i]));
        if (i != sections.incoming.length - 1) {
          widgets.add(const Divider(height: 1));
        }
      }
    }

    widgets.add(_buildSectionHeader('Outgoing'));
    if (sections.outgoing.isEmpty) {
      widgets.add(_buildEmptyState('No outgoing friend requests.'));
    } else {
      for (var i = 0; i < sections.outgoing.length; i++) {
        widgets.add(_buildOutgoingTile(sections.outgoing[i]));
        if (i != sections.outgoing.length - 1) {
          widgets.add(const Divider(height: 1));
        }
      }
    }

    if (sections.incoming.isEmpty && sections.outgoing.isEmpty) {
      widgets.add(
        const Padding(
          padding: EdgeInsets.only(top: 12),
          child: Center(child: Text('No friend requests right now.')),
        ),
      );
    }

    return widgets;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Friend Requests'),
      ),
      body: FutureBuilder<_FriendRequestSections>(
        future: _requestsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            String message = 'Failed to load friend requests.';
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
                      onPressed: _refreshRequests,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          final sections = snapshot.data ??
              const _FriendRequestSections(
                incoming: [],
                outgoing: [],
              );

          return RefreshIndicator(
            onRefresh: _refreshRequests,
            child: ListView(
              children: _buildSections(sections),
            ),
          );
        },
      ),
    );
  }
}

class _FriendRequestSections {
  final List<Map<String, dynamic>> incoming;
  final List<Map<String, dynamic>> outgoing;

  const _FriendRequestSections({
    required this.incoming,
    required this.outgoing,
  });
}