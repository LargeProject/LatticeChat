import 'package:flutter/material.dart' hide Page;
import 'package:latticechat/logic/models/message.dart';
import 'package:latticechat/logic/models/ws/create_message.dart';
import 'package:latticechat/logic/services/socket.dart';
import 'package:latticechat/pages/chat_list.dart';
import 'package:provider/provider.dart';

import '../logic/services/api.dart';

class ChatMessage {
  final String text;
  final bool isMe;
  final DateTime time;

  ChatMessage({
    required this.text,
    required this.isMe,
    required this.time,
  });
}

class OpenChatPage extends StatefulWidget {
  final String jwt;
  final String otherUserName;
  final String conversationId;

  const OpenChatPage({
    super.key,
    required this.jwt,
    required this.otherUserName,
    required this.conversationId
  });

  @override
  State<OpenChatPage> createState() => _OpenChatPageState();
}

class _OpenChatPageState extends State<OpenChatPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  SocketService? _socket;
  List<ChatMessage> _messages = [];

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  void _refresh() async {
    final userApi = ApiServices.getConversationServices();
    final response = await userApi.fetchConversationMessages(widget.jwt, widget.conversationId);
    final messages = response.messages;

    setState(() {
      _messages = messages.map((message) =>
          ChatMessage(
              text: message.content,
              isMe: message.senderId == userId,
              time: message.createdAt
          )
      ).toList();
    });
  }

  void _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _socket!.emitMessage(CreateMessageModel(conversationId: widget.conversationId, senderId: userId, content: text));

    /*setState(() {
      /*_messages.add(
        ChatMessage(
          text: text,
          isMe: true,
          time: DateTime.now(),
        ),
      );*/
    });*/

    _messageController.clear();
    _scrollToBottom();

    /*Future.delayed(const Duration(milliseconds: 700), () {
      if (!mounted) return;

      setState(() {
        _messages.add(
          ChatMessage(
            text: "Got it.",
            isMe: false,
            time: DateTime.now(),
          ),
        );
      });

      _scrollToBottom();
    });*/
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _formatTime(DateTime time) {
    int hour = time.hour;
    final int minute = time.minute;
    final String period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour == 0) hour = 12;

    final String minuteStr = minute.toString().padLeft(2, '0');
    return "$hour:$minuteStr $period";
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _init() {
    _socket!.onMessage((message) {
      setState(() {
        final newMessage = ChatMessage(
            text: message.content,
            isMe: message.senderId == userId,
            time: message.createdAt
        );
        _messages.add(newMessage);
      });
    });
  }

  @override
  Widget build(BuildContext context) {

    _socket = Provider.of<SocketService>(context, listen: false);
    _init();

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.otherUserName),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _MessageBubble(
                  text: message.text,
                  isMe: message.isMe,
                  time: _formatTime(message.time),
                );
              },
            ),
          ),
          const Divider(height: 1),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                      decoration: InputDecoration(
                        hintText: "Type a message...",
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    child: IconButton(
                      onPressed: _sendMessage,
                      icon: const Icon(Icons.send),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final String text;
  final bool isMe;
  final String time;

  const _MessageBubble({
    required this.text,
    required this.isMe,
    required this.time,
  });

  @override
  Widget build(BuildContext context) {
    final bubbleColor = isMe
        ? Theme.of(context).colorScheme.primary
        : Colors.grey.shade800;

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isMe ? 16 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 16),
          ),
        ),
        child: Column(
          crossAxisAlignment:
          isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Text(
              text,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              time,
              style: TextStyle(
                color: Colors.white.withOpacity(0.75),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}