class CreateMessageModel {
  final String conversationId;
  final String senderId;
  final String content;

  CreateMessageModel({
    required this.conversationId,
    required this.senderId,
    required this.content
  });

  Map<String, dynamic> toJson() => {
    'conversationId': conversationId,
    'senderId': senderId,
    'content': content
  };
}