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

    List<dynamic> jsConversations = json['conversations'];
    List<dynamic> jsFriends = json['friends'];

    final conversations = jsConversations.map((jsonConversation) => ConversationModel.fromJson(jsonConversation as Map<String, dynamic>)).toList();
    final friends = jsFriends.map((jsonFriend) => BasicUserModel.fromJson(jsonFriend as Map<String, dynamic>)).toList();

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
    return BasicUserModel._(
      id: json['id'],
      username: json['name'],
      createdAt: DateTime.parse(json['createdAt'])
    );
  }
}