import 'user.dart';

class ConversationModel {
  final String id;
  final UserModel otherUser;
  final String lastMessage;
  final String lastMessageTime;

  ConversationModel._({
    required this.id,
    required this.otherUser,
    required this.lastMessage,
    required this.lastMessageTime,
  });

  static ConversationModel fromJson(Map<String, dynamic> json) {
    return ConversationModel._(
      id: json['id'],
      otherUser: UserModel.fromJson(json['otherUser']),
      lastMessage: json['lastMessage'] ?? '',
      lastMessageTime: json['lastMessageTime'] ?? '',
    );
  }
}