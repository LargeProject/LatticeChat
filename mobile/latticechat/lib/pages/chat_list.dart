import 'package:flutter/material.dart';
import 'package:latticechat/logic/api.dart';
import 'package:latticechat/logic/models/error.dart';
import 'package:latticechat/logic/models/user.dart';
import 'open_chat.dart';

class ChatListPage extends StatelessWidget {
  final UserModel currentUser;

  const ChatListPage({
    super.key,
    required this.currentUser,
  });

  @override
  Widget build(BuildContext context) {
    final chats = [
      {
        "name": "Darren",
        "lastMessage": "See you later",
        "time": "2:14 PM",
      },
      {
        "name": "Alex",
        "lastMessage": "Did you finish it?",
        "time": "1:48 PM",
      },
      {
        "name": "Maria",
        "lastMessage": "Call me when you're free",
        "time": "11:32 AM",
      },
      {
        "name": "Jordan",
        "lastMessage": "I just sent the file",
        "time": "Yesterday",
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text("Messages"),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_alt_1),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AddFriendDialog(currentUser: currentUser),
              );
            },
          ),
        ],
      ),
      body: ListView.separated(
        itemCount: chats.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final chat = chats[index];
          final name = chat["name"]!;
          final lastMessage = chat["lastMessage"]!;
          final time = chat["time"]!;

          return ListTile(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 8,
            ),
            leading: CircleAvatar(
              radius: 24,
              child: Text(
                name[0],
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            title: Text(
              name,
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
                  builder: (context) => OpenChatPage(otherUserName: name),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class AddFriendDialog extends StatefulWidget {
  final UserModel currentUser;

  const AddFriendDialog({
    super.key,
    required this.currentUser,
  });

  @override
  State<AddFriendDialog> createState() => _AddFriendDialogState();
}

class _AddFriendDialogState extends State<AddFriendDialog> {
  final ApiServices _api = ApiServices();
  final TextEditingController _controller = TextEditingController();

  bool _isSearching = false;
  bool _isSending = false;
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
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _statusMessage = null;
      _foundUserId = null;
      _foundUsername = null;
    });

    try {
      final user = await _api.fetchBasicUserByName(username);
      debugPrint('FOUND USER ID: ${user.id}');
      debugPrint('FOUND USERNAME: ${user.username}');
      debugPrint('CURRENT USER ID: ${widget.currentUser.id}');
      if (!mounted) return;

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
    } catch (e) {
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
    if (_foundUserId == null) return;

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
      await _api.sendFriendRequest(widget.currentUser.id, _foundUserId!);

      if (!mounted) return;

      setState(() {
        _statusMessage = 'Friend request sent to $_foundUsername.';
      });
    } on ApiError catch (e) {
      if (!mounted) return;

      setState(() {
        _statusMessage = e.message;
      });
    } catch (e) {
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
              : () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: _isSearching ? null : _findUser,
          child: _isSearching
              ? const SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          )
              : const Text('Find'),
        ),
        ElevatedButton(
          onPressed: (_foundUserId != null && !_isSending)
              ? _sendFriendRequest
              : null,
          child: _isSending
              ? const SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          )
              : const Text('Add'),
        ),
      ],
    );
  }
}