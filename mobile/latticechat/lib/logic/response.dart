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
    return FetchBasicUserInfoResponse._(
        user: BasicUserModel.fromJson(json['basicUserInfo']),
        message: json['message']
    );
  }
}

class FetchFriendRequestsResponse {
  final List<FriendRequestModel> friendRequests;
  final String message;

  FetchFriendRequestsResponse._({required this.friendRequests, required this.message});

  static FetchFriendRequestsResponse fromJson(Map<String, dynamic> json) {
    List<dynamic> jsFriends = json['friendRequests'];
    final friendRequests = jsFriends.map((jsonFriendRequest) => FriendRequestModel.fromJson(jsonFriendRequest as Map<String, dynamic>)).toList();

    return FetchFriendRequestsResponse._(
      friendRequests: friendRequests,
      message: json['message']
    );
  }
}

class FetchConversationsResponse {
  final List<ConversationModel> conversations;
  final String message;

  FetchConversationsResponse._({required this.conversations, required this.message});

  static FetchConversationsResponse fromJson(Map<String, dynamic> json) {
    List<dynamic> jsConversations = json['conversations'];
    final conversations = jsConversations.map((jsonConversation) => ConversationModel.fromJson(jsonConversation as Map<String, dynamic>)).toList();

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
    List<dynamic> jsMessages = json['messages'];
    final messages = jsMessages.map((jsonMessage) => MessageModel.fromJson(jsonMessage as Map<String, dynamic>)).toList();

    return FetchConversationMessagesResponse._(
        messages: messages,
        message: json['message']
    );

  }
}