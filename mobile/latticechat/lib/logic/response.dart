import 'package:latticechat/logic/models/conversation.dart';
import 'package:latticechat/logic/models/friend_request.dart';
import 'package:latticechat/logic/models/user.dart';

import 'models/message.dart';

class SignInResponse {
  final String jsonWT;

  SignInResponse._({required this.jsonWT});

  static SignInResponse fromJson(Map<String, dynamic> json) {
    return SignInResponse._(
        jsonWT: json['jsonWT']
    );
  }
}

class FetchUserInfoResponse {
  final UserModel user;
  final String message;

  FetchUserInfoResponse._({required this.user, required this.message});

  static FetchUserInfoResponse fromJson(Map<String, dynamic> json) {
    return FetchUserInfoResponse._(
        user: UserModel.fromJson(json['userInfo']),
        message: json['message']
    );
  }
}

class FetchBasicUserInfoResponse {
  final BasicUserModel user;
  final String message;

  FetchBasicUserInfoResponse._({required this.user, required this.message});

  static FetchBasicUserInfoResponse fromJson(Map<String, dynamic> json) {
    final dynamic rawUser =
        json['basicUserInfo'] ??
            json['user'] ??
            json['userInfo'] ??
            json;

    return FetchBasicUserInfoResponse._(
      user: BasicUserModel.fromJson(Map<String, dynamic>.from(rawUser)),
      message: (json['message'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': {
        'id': user.id,
        'username': user.username,
        'createdAt': user.createdAt.toIso8601String(),
      },
      'message': message,
    };
  }
}

class FetchFriendRequestsResponse {
  final List<dynamic> friendRequests;
  final String message;

  FetchFriendRequestsResponse._({
    required this.friendRequests,
    required this.message,
  });

  static FetchFriendRequestsResponse fromJson(Map<String, dynamic> json) {
    final raw = json['friendRequests'];

    List<dynamic> friendRequests = [];
    if (raw is List) {
      friendRequests = raw;
    }

    return FetchFriendRequestsResponse._(
      friendRequests: friendRequests,
      message: (json['message'] ?? '').toString(),
    );
  }
}
class FetchConversationsResponse {
  final List<ConversationModel> conversations;
  final String message;

  FetchConversationsResponse._({required this.conversations, required this.message});

  static FetchConversationsResponse fromJson(Map<String, dynamic> json) {
    List<Map<String, dynamic>> jsonConversations = json['conversations'].cast<Map<String, dynamic>>();
    final conversations = jsonConversations.map((jsonConversation) => ConversationModel.fromJson(jsonConversation)).toList();

    return FetchConversationsResponse._(
        conversations: conversations,
        message: json['message']
    );
  }
}

class FetchConversationMessagesResponse {
  final List<MessageModel> messages;
  final String message;

  FetchConversationMessagesResponse._({required this.messages, required this.message});

  static FetchConversationMessagesResponse fromJson(Map<String, dynamic> json) {
    List<Map<String, dynamic>> jsonMessages = json['messages'].cast<Map<String, dynamic>>();
    final messages = jsonMessages.map((jsonMessage) => MessageModel.fromJson(jsonMessage)).toList();

    return FetchConversationMessagesResponse._(
        messages: messages,
        message: json['message']
    );

  }
}