import 'package:flutter/material.dart' hide Page;
import 'package:latticechat/logic/models/conversation.dart';
import 'package:latticechat/logic/services/api.dart';
import 'package:latticechat/logic/services/socket.dart';
import 'package:provider/provider.dart';
import '../logic/models/ws/hand_shake.dart';
import 'open_chat.dart';

// UNDO LATER
String userId = '';

class ChatListPage extends StatefulWidget {
  final String jwt;

  const ChatListPage({
    super.key,
    required this.jwt
  });

  @override
  State<StatefulWidget> createState() => ChatListState();
}

class ChatListState extends State<ChatListPage> {

  SocketService? _socket;
  List<ConversationModel> _conversations = List<ConversationModel>.empty(growable: true);

  Future<void> _init() async {

    _socket!.connect();
    if(_socket!.status != Status.connected) return;

    final userApi = ApiServices.getUserServices();
    final infoResponse = await userApi.fetchUser(widget.jwt);
    final user = infoResponse.user;
    userId = user.id;

    final ack = await _socket!.emitHandShake(InitHandShake(jwt: widget.jwt, userId: user.id));
  }

  Future<void> _refresh() async {
    final response = await ApiServices.getConversationServices().fetchConversations(widget.jwt);
    final conversations = response.conversations;

    setState(() {
      _conversations = conversations;
    });
  }

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  @override
  Widget build(BuildContext context) {

    _socket = context.watch<SocketService>();

    _init();

    final chats = _conversations;

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
                builder: (context) => AddFriendDialog(jwt: widget.jwt),
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
          var name = '';
          if(chat.isDirectMessage) {
            // fix later
            name = chat.members[1].username;
          } else {
            name = chat.name;
          }

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
            onTap: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChangeNotifierProvider.value(
                    value: _socket,
                    child: OpenChatPage(jwt: widget.jwt, otherUserName: name, conversationId: chat.id),
                  ),
                ),
              );
              _refresh();
            },
          );
        },
      ),
    );
  }
}

class AddFriendDialog extends StatefulWidget {
  final String jwt;

  const AddFriendDialog({
    super.key,
    required this.jwt,
  });

  @override
  State<AddFriendDialog> createState() => _AddFriendDialogState();
}

class _AddFriendDialogState extends State<AddFriendDialog> {
  final _userServices = ApiServices.getUserServices();
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
      final response = await _userServices.fetchBasicUserByName(username);
      final user = response.user;

      if (!mounted) return;

      setState(() {
        _foundUserId = user.id;
        _foundUsername = user.username;
        _statusMessage = 'User found: ${user.username}';
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

    setState(() {
      _isSending = true;
      _statusMessage = null;
    });

    try {
      await _userServices.sendFriendRequest(widget.jwt, _foundUserId!);

      if (!mounted) return;

      setState(() {
        _statusMessage = 'Friend request sent to $_foundUsername.';
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