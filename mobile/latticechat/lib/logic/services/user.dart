import 'dart:convert';

import 'package:latticechat/logic/response.dart';
import 'package:latticechat/logic/util/http.dart';

import '../util/error.dart';

class UserServices {
  final String _baseUrl;

  UserServices(this._baseUrl);

  Future<FetchUserInfoResponse> fetchUser(String jwt) async {
    final response = await HttpUtil.sendAuthGet(jwt, '$_baseUrl/users/me');
    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return FetchUserInfoResponse.fromJson(body);
    } else {
      throw ApiError.fromBody(body);
    }
  }

  Future<FetchBasicUserInfoResponse> fetchBasicUserByName(String name) async {
    final response = await HttpUtil.sendGet('$_baseUrl/users/$name?byName=true');
    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return FetchBasicUserInfoResponse.fromJson(body);
    } else {
      throw ApiError.fromBody(body);
    }
  }

  Future<FetchBasicUserInfoResponse> fetchBasicUserById(String userId) async {
    final response = await HttpUtil.sendGet('$_baseUrl/users/$userId');
    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return FetchBasicUserInfoResponse.fromJson(body);
    } else {
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> deleteUser(String jwt) async {
    final response = await HttpUtil.sendAuthDelete(jwt, '$_baseUrl/users/me', {});

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> acceptFriendRequest(String senderJWT, String targetId) async {
    final response = await HttpUtil.sendAuthPatch(senderJWT, '$_baseUrl/users/me/friend-requests', {
      'targetId': targetId
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> sendFriendRequest(String senderJWT, String targetUsername) async {
    final response = await HttpUtil.sendAuthPost(senderJWT, '$_baseUrl/users/me/friend-requests', {
      'targetUsername': targetUsername
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }

  Future<FetchFriendRequestsResponse> fetchFriendRequests(String jwt) async {
    final response = await HttpUtil.sendAuthGet(jwt, '$_baseUrl/users/me/friend-requests');
    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return FetchFriendRequestsResponse.fromJson(body);
    } else {
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> removeFriendRequest(String senderJWT, String targetId) async {
    final response = await HttpUtil.sendAuthDelete(senderJWT, '$_baseUrl/users/me/friend-requests', {
      'targetId': targetId
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> removeFriend(String senderJWT, String targetId) async {
    final response = await HttpUtil.sendAuthDelete(senderJWT, '$_baseUrl/users/me/friends', {
      'targetId': targetId
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }
}