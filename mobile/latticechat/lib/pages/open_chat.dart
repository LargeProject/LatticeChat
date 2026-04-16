import 'dart:async';

import 'package:flutter/material.dart';
import 'package:latticechat/logic/models/message.dart';
import 'package:latticechat/logic/models/user.dart';
import 'package:latticechat/logic/models/ws/create_message.dart';
import 'package:latticechat/logic/models/ws/hand_shake.dart';
import 'package:latticechat/logic/services/api.dart';
import 'package:latticechat/logic/services/socket.dart';
import 'package:latticechat/logic/util/error.dart';
import 'package:latticechat/theme.dart';

class OpenChatPage extends StatefulWidget {
  final String otherUserName;
  final String conversationId;
  final UserModel currentUser;
  final String jwt;

  const OpenChatPage({
    super.key,
    required this.otherUserName,
    required this.conversationId,
    required this.currentUser,
    required this.jwt,
  });

  @override
  State<OpenChatPage> createState() => _OpenChatPageState();
}

class _OpenChatPageState extends State<OpenChatPage> {
  final _conversationApi = ApiServices.getConversationServices();
  final SocketService _socketService = ApiServices.getSocketService();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<_ChatMessageView> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;
  String? _loadError;
  Timer? _socketWaitTimer;
  bool _handshakeSent = false;

  @override
  void initState() {
    super.initState();
    _initializeChat();
  }

  Future<void> _initializeChat() async {
    await _loadMessages();
    _setupSocket();
  }

  Future<void> _loadMessages() async {
    if (widget.conversationId.trim().isEmpty) {
      setState(() {
        _messages.clear();
        _isLoading = false;
        _loadError = null;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _loadError = null;
    });

    try {
      final response = await _conversationApi.fetchConversationMessages(
        widget.jwt,
        widget.conversationId,
      );

      if (!mounted) return;

      setState(() {
        _messages
          ..clear()
          ..addAll(
            response.messages.map(
                  (message) => _ChatMessageView(
                id: message.id,
                senderId: message.senderId,
                conversationId: message.conversationId,
                content: message.content,
                createdAt: message.createdAt,
              ),
            ),
          );
        _isLoading = false;
      });

      _scrollToBottom(jump: true);
    } on ApiError catch (error) {
      if (!mounted) return;

      setState(() {
        _loadError = error.message;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        _loadError = 'Failed to load messages.';
        _isLoading = false;
      });
    }
  }

  void _setupSocket() {
    _socketService.connect();
    _socketService.onMessage(_handleIncomingMessage);

    if (_socketService.status == Status.connected) {
      _performHandshake();
      return;
    }

    _socketWaitTimer =
        Timer.periodic(const Duration(milliseconds: 300), (timer) {
          if (!mounted) {
            timer.cancel();
            return;
          }

          if (_socketService.status == Status.connected) {
            timer.cancel();
            _performHandshake();
          }
        });
  }

  Future<void> _performHandshake() async {
    if (_handshakeSent) return;

    _handshakeSent = true;
    await _socketService.emitHandShake(
      InitHandShake(
        jwt: widget.jwt,
        userId: widget.currentUser.id,
      ),
    );
  }

  void _handleIncomingMessage(MessageModel message) {
    if (!mounted) return;
    if (message.conversationId != widget.conversationId) return;

    final existingById = _messages.any(
          (existing) => existing.id.isNotEmpty && existing.id == message.id,
    );
    if (existingById) return;

    final optimisticIndex = _messages.indexWhere(
          (existing) =>
      existing.isPending &&
          existing.senderId == message.senderId &&
          existing.conversationId == message.conversationId &&
          existing.content.trim() == message.content.trim() &&
          existing.createdAt.difference(message.createdAt).inSeconds.abs() <= 15,
    );

    setState(() {
      if (optimisticIndex != -1) {
        _messages[optimisticIndex] = _ChatMessageView(
          id: message.id,
          senderId: message.senderId,
          conversationId: message.conversationId,
          content: message.content,
          createdAt: message.createdAt,
        );
      } else {
        _messages.add(
          _ChatMessageView(
            id: message.id,
            senderId: message.senderId,
            conversationId: message.conversationId,
            content: message.content,
            createdAt: message.createdAt,
          ),
        );
      }
    });

    _scrollToBottom(jump: false);
  }

  Future<void> _refreshMessages() async {
    await _loadMessages();
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;

    if (widget.conversationId.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('This chat cannot send messages yet.'),
        ),
      );
      return;
    }

    if (_socketService.status != Status.connected) {
      _socketService.connect();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Connecting to chat server...'),
        ),
      );
      return;
    }

    final optimisticMessage = _ChatMessageView(
      id: 'local-${DateTime.now().microsecondsSinceEpoch}',
      senderId: widget.currentUser.id,
      conversationId: widget.conversationId,
      content: text,
      createdAt: DateTime.now(),
      isPending: true,
    );

    setState(() {
      _isSending = true;
      _messages.add(optimisticMessage);
    });

    _messageController.clear();
    _scrollToBottom(jump: false);

    try {
      final ack = await _socketService.emitMessage(
        CreateMessageModel(
          conversationId: widget.conversationId,
          senderId: widget.currentUser.id,
          content: text,
        ),
      );

      if (!mounted) return;

      final ackMessage = _normalizeAckMessage(ack);
      if (ackMessage != null) {
        final existingById = _messages.any(
              (message) => message.id.isNotEmpty && message.id == ackMessage.id,
        );

        setState(() {
          final optimisticIndex = _messages.indexWhere(
                (message) => identical(message, optimisticMessage),
          );

          if (optimisticIndex != -1) {
            _messages[optimisticIndex] = _ChatMessageView(
              id: ackMessage.id,
              senderId: ackMessage.senderId,
              conversationId: ackMessage.conversationId,
              content: ackMessage.content,
              createdAt: ackMessage.createdAt,
            );
          } else if (!existingById) {
            _messages.add(
              _ChatMessageView(
                id: ackMessage.id,
                senderId: ackMessage.senderId,
                conversationId: ackMessage.conversationId,
                content: ackMessage.content,
                createdAt: ackMessage.createdAt,
              ),
            );
          }
        });

        _scrollToBottom(jump: false);
      } else {
        Future.delayed(const Duration(seconds: 6), () {
          if (!mounted) return;

          final index = _messages.indexWhere(
                (message) => identical(message, optimisticMessage),
          );

          if (index != -1 && _messages[index].isPending) {
            setState(() {
              _messages[index] = _messages[index].copyWith(isPending: false);
            });
          }
        });
      }
    } catch (_) {
      if (!mounted) return;

      final receivedBack = _messages.any(
            (message) =>
        !identical(message, optimisticMessage) &&
            message.senderId == optimisticMessage.senderId &&
            message.conversationId == optimisticMessage.conversationId &&
            message.content.trim() == optimisticMessage.content.trim() &&
            message.createdAt
                .difference(optimisticMessage.createdAt)
                .inSeconds
                .abs() <=
                15,
      );

      if (receivedBack) {
        setState(() {
          _messages.removeWhere((message) => identical(message, optimisticMessage));
        });
      } else {
        setState(() {
          final index = _messages.indexWhere(
                (message) => identical(message, optimisticMessage),
          );
          if (index != -1) {
            _messages[index] = _messages[index].copyWith(isPending: false);
          }
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to send message.'),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSending = false;
        });
      }
    }
  }

  MessageModel? _normalizeAckMessage(dynamic ack) {
    if (ack is Map<String, dynamic>) {
      if ((ack['id'] ?? ack['_id']) != null && ack['content'] != null) {
        return MessageModel.fromJson(ack);
      }

      if (ack['message'] is Map<String, dynamic>) {
        final message = Map<String, dynamic>.from(ack['message']);
        if ((message['id'] ?? message['_id']) != null &&
            message['content'] != null) {
          return MessageModel.fromJson(message);
        }
      }

      if (ack['data'] is Map<String, dynamic>) {
        final data = Map<String, dynamic>.from(ack['data']);
        if ((data['id'] ?? data['_id']) != null && data['content'] != null) {
          return MessageModel.fromJson(data);
        }

        if (data['message'] is Map<String, dynamic>) {
          final message = Map<String, dynamic>.from(data['message']);
          if ((message['id'] ?? message['_id']) != null &&
              message['content'] != null) {
            return MessageModel.fromJson(message);
          }
        }
      }
    }

    if (ack is Map) {
      final map = Map<String, dynamic>.from(ack);
      return _normalizeAckMessage(map);
    }

    return null;
  }

  void _scrollToBottom({bool jump = false}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;

      final position = _scrollController.position.maxScrollExtent;

      if (jump) {
        _scrollController.jumpTo(position);
      } else {
        _scrollController.animateTo(
          position,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _messageText(_ChatMessageView message) {
    return message.content;
  }

  bool _isMe(_ChatMessageView message) {
    return message.senderId == widget.currentUser.id;
  }

  DateTime? _messageTime(_ChatMessageView message) {
    return message.createdAt.toLocal();
  }

  String _formatTime(DateTime? time) {
    if (time == null) return '';

    int hour = time.hour;
    final minute = time.minute;
    final period = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    if (hour == 0) hour = 12;

    final minuteStr = minute.toString().padLeft(2, '0');
    return '$hour:$minuteStr $period';
  }

  Widget _buildMessages() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 16),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        final message = _messages[index];
        return _MessageBubble(
          text: _messageText(message),
          isMe: _isMe(message),
          time: _formatTime(_messageTime(message)),
          isPending: message.isPending,
        );
      },
    );
  }

  @override
  void dispose() {
    _socketWaitTimer?.cancel();
    _socketService.removeMessageListener();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasConversation = widget.conversationId.trim().isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.otherUserName),
      ),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
        child: Column(
          children: [
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: AppContainerStyles.genericBox,
                child: Builder(
                  builder: (context) {
                    if (_isLoading) {
                      return const Center(
                        child: CircularProgressIndicator(),
                      );
                    }

                    if (_loadError != null) {
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                _loadError!,
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                              const SizedBox(height: 12),
                              ElevatedButton(
                                onPressed: _refreshMessages,
                                style: AppButtonStyles.primaryElevated,
                                child: const Text('Retry'),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    if (_messages.isEmpty) {
                      return RefreshIndicator(
                        onRefresh: _refreshMessages,
                        color: primaryColor,
                        backgroundColor: foregroundColor,
                        child: ListView(
                          controller: _scrollController,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 12,
                          ),
                          children: [
                            const SizedBox(height: 220),
                            Center(
                              child: Text(
                                hasConversation ? 'No messages yet.' : 'No messages yet.',
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: _refreshMessages,
                      color: primaryColor,
                      backgroundColor: foregroundColor,
                      child: _buildMessages(),
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 12),
            Container(
              decoration: AppContainerStyles.genericBox,
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                      decoration: InputDecoration(
                        hintText: hasConversation
                            ? 'Type a message...'
                            : 'This chat is not ready for sending yet',
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    width: 64,
                    child: ElevatedButton(
                      onPressed: _sendMessage,
                      style: AppButtonStyles.primaryElevated,
                      child: _isSending
                          ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                          : const Icon(Icons.send),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final String text;
  final bool isMe;
  final String time;
  final bool isPending;

  const _MessageBubble({
    required this.text,
    required this.isMe,
    required this.time,
    required this.isPending,
  });

  @override
  Widget build(BuildContext context) {
    final bubbleColor = isMe ? Colors.white : backgroundColor;
    final textColor = isMe ? Colors.black : primaryColor;

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Opacity(
        opacity: isPending ? 0.7 : 1,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 4),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.72,
          ),
          decoration: BoxDecoration(
            color: bubbleColor,
            border: Border.all(
              color: isMe ? Colors.white : borderColor,
            ),
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(8),
              topRight: const Radius.circular(8),
              bottomLeft: Radius.circular(isMe ? 8 : 2),
              bottomRight: Radius.circular(isMe ? 2 : 8),
            ),
          ),
          child: Column(
            crossAxisAlignment:
            isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Text(
                text,
                style: TextStyle(
                  color: textColor,
                  fontSize: 15,
                ),
              ),
              if (time.isNotEmpty || isPending) ...[
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isPending) ...[
                      Text(
                        'Sending',
                        style: TextStyle(
                          color: textColor.withAlpha(170),
                          fontSize: 11,
                        ),
                      ),
                      const SizedBox(width: 6),
                    ],
                    if (time.isNotEmpty)
                      Text(
                        time,
                        style: TextStyle(
                          color: textColor.withAlpha(170),
                          fontSize: 11,
                        ),
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _ChatMessageView {
  final String id;
  final String senderId;
  final String conversationId;
  final String content;
  final DateTime createdAt;
  final bool isPending;

  const _ChatMessageView({
    required this.id,
    required this.senderId,
    required this.conversationId,
    required this.content,
    required this.createdAt,
    this.isPending = false,
  });

  _ChatMessageView copyWith({
    String? id,
    String? senderId,
    String? conversationId,
    String? content,
    DateTime? createdAt,
    bool? isPending,
  }) {
    return _ChatMessageView(
      id: id ?? this.id,
      senderId: senderId ?? this.senderId,
      conversationId: conversationId ?? this.conversationId,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
      isPending: isPending ?? this.isPending,
    );
  }
}