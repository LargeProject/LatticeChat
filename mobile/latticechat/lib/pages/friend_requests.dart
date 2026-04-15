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
  late Future<List<Map<String, dynamic>>> _requestsFuture;

  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  void _loadRequests() {
    _requestsFuture = _fetchRequests();
  }

  Future<List<Map<String, dynamic>>> _fetchRequests() async {
    final response = await _userApi.fetchFriendRequests(widget.jwt);
    final raw = response.friendRequests;

    if (raw is List) {
      return raw
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    }

    return [];
  }

  Future<void> _refreshRequests() async {
    setState(() {
      _loadRequests();
    });
    await _requestsFuture;
  }

  String _requestUserId(Map<String, dynamic> request) {
    return (request['id'] ?? request['_id'] ?? '').toString();
  }

  String _requestUsername(Map<String, dynamic> request) {
    return (request['username'] ?? request['name'] ?? 'Unknown User').toString();
  }

  Future<void> _acceptRequest(Map<String, dynamic> request) async {
    final targetId = _requestUserId(request);
    final username = _requestUsername(request);

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

  Future<void> _declineRequest(Map<String, dynamic> request) async {
    final targetId = _requestUserId(request);
    final username = _requestUsername(request);

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Friend Requests'),
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
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

          final requests = snapshot.data ?? [];

          if (requests.isEmpty) {
            return RefreshIndicator(
              onRefresh: _refreshRequests,
              child: ListView(
                children: const [
                  SizedBox(height: 220),
                  Center(child: Text('No friend requests right now.')),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _refreshRequests,
            child: ListView.separated(
              itemCount: requests.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final request = requests[index];
                final username = _requestUsername(request);

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
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
                        onPressed: () => _declineRequest(request),
                        child: const Text('Decline'),
                      ),
                      ElevatedButton(
                        onPressed: () => _acceptRequest(request),
                        child: const Text('Accept'),
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}