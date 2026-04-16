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
    final user = (json['user'] as Map<String, dynamic>? ?? json);

    final jsonConversations = ((json['conversations'] ?? []) as List)
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();

    final jsonFriends = ((json['friends'] ?? []) as List)
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();

    final conversations = jsonConversations
        .map((jsonConversation) => ConversationModel.fromJson(jsonConversation))
        .toList();

    final friends = jsonFriends
        .map((jsonFriend) => BasicUserModel.fromJson(jsonFriend))
        .toList();

    return UserModel._(
      id: (user['id'] ?? user['_id'] ?? '').toString(),
      username: (user['username'] ?? user['name'] ?? '').toString(),
      email: (user['email'] ?? '').toString(),
      friends: friends,
      conversations: conversations,
      createdAt: DateTime.parse(user['createdAt']),
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