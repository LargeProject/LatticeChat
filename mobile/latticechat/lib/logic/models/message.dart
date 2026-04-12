class MessageModel {
  final String id;
  final String senderId;
  final String conversationId;
  final String content;
  final DateTime createdAt;
  
  MessageModel._({
    required this.id,
    required this.senderId,
    required this.conversationId,
    required this.content,
    required this.createdAt
  });
  
  static MessageModel fromJson(Map<String, dynamic> json) {
    return MessageModel._(
        id: json['_id'],
        senderId: json['senderId'],
        conversationId: json['conversationId'],
        content: json['content'],
        createdAt: DateTime.parse(json['createdAt'])
    );
  }
}