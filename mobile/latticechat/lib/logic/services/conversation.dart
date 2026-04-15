import 'dart:convert';

import 'package:latticechat/logic/response.dart';

import '../util/error.dart';
import '../util/http.dart';

class ConversationServices {

  final String _baseUrl;

  ConversationServices(this._baseUrl);

  Future<FetchConversationsResponse> fetchConversations(String jwt, [String search = '']) async {
    final response = await HttpUtil.sendAuthGet(jwt, '$_baseUrl/users/me/conversations?search=$search');
    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return FetchConversationsResponse.fromJson(body);
    } else {
      throw ApiError.fromBody(body);
    }
  }

  Future<FetchConversationMessagesResponse> fetchConversationMessages(String jwt, String conversationId) async {
    final response = await HttpUtil.sendAuthGet(jwt, '$_baseUrl/users/me/conversations/$conversationId/messages');
    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return FetchConversationMessagesResponse.fromJson(body);
    } else {
      throw ApiError.fromBody(body);
    }
  }

}