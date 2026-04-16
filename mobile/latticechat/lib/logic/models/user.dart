import 'conversation.dart';

class UserModel {

  final String id;
  final String username;
  final String email;
  final List<BasicUserModel> friends;
  final List<ConversationModel> conversations;
  final DateTime createdAt;

  UserModel._({
    required this.id,
    required this.username,
    required this.email,
    required this.friends,
    required this.conversations,
    required this.createdAt
  });

  static UserModel fromJson(Map<String, dynamic> json) {
    final user = json['user'];

    List<Map<String, dynamic>> jsonConversations = json['conversations'].cast<Map<String, dynamic>>();
    List<Map<String, dynamic>> jsonFriends = json['friends'].cast<Map<String, dynamic>>();

    final conversations = jsonConversations.map((jsonConversation) => ConversationModel.fromJson(jsonConversation)).toList();
    final friends = jsonFriends.map((jsonFriend) => BasicUserModel.fromJson(jsonFriend)).toList();

    return UserModel._(
      id: user['id'],
      username: user['name'],
      email: user['email'],
      friends: friends,
      conversations: conversations,
      createdAt: DateTime.parse(user['createdAt'])
    );
  }
}

class BasicUserModel {
  final String id;
  final String username;
  final DateTime createdAt;

  BasicUserModel._({
    required this.id,
    required this.username,
    required this.createdAt
  });

  static BasicUserModel fromJson(Map<String, dynamic> json) {
    final data = json['user'] is Map<String, dynamic>
        ? json['user'] as Map<String, dynamic>
        : json;

    return BasicUserModel._(
      id: (data['id'] ?? data['_id'] ?? '').toString(),
      username: (data['username'] ?? data['name'] ?? '').toString(),
      createdAt: DateTime.parse(data['createdAt']),
    );
  }
}