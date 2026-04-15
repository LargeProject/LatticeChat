import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:latticechat/logic/models/error.dart';
import 'package:latticechat/logic/models/response.dart';
import 'package:latticechat/logic/models/user.dart';

class ApiServices {
  static final String _baseUrl = dotenv.env['API_BASE_URL']!;
  static String? _token;

  static void setToken(String token) {
    _token = token;
  }

  static String? get token => _token;

  Future<bool> attemptSignUp(String username, String email, String password) async {
    final response = await _post('$_baseUrl/auth/sign-up/email', {
      'name': username,
      'email': email,
      'password': password,
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError(type: body['code'], message: body['message']);
    }
  }

  Future<SignInResponse> attemptSignIn(String email, String password) async {
    final response = await _post('$_baseUrl/auth/sign-in/email', {
      'email': email,
      'password': password,
    });

    final body = jsonDecode(response.body);
    body['jsonWT'] = response.headers['set-auth-token'];

    if (response.statusCode == 200) {
      final signInResponse = SignInResponse.fromJson(body)!;
      if (signInResponse.jsonWT.isNotEmpty) {
        ApiServices.setToken(signInResponse.jsonWT);
      }
      return signInResponse;
    } else {
      throw ApiError(type: body['code'], message: body['message']);
    }
  }

  Future<bool> attemptSendEmailVerification(String email) async {
    final response = await _post(
      '$_baseUrl/auth/email-otp/send-verification-otp',
      {
        'email': email,
        'type': 'email-verification',
      },
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError(type: body['code'], message: body['message']);
    }
  }

  Future<bool> attemptVerifyEmail(String email, String code) async {
    final response = await _post('$_baseUrl/auth/email-otp/verify-email', {
      'email': email,
      'otp': code,
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError(type: body['code'], message: body['message']);
    }
  }

  Future<UserModel> fetchBasicUserByName(String username) async {
    final response = await _get('$_baseUrl/users/$username?byName=true');
    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return UserModel.fromJson(body['basicUserInfo']);
    } else {
      throw ApiError(
        type: body['code'] ?? 'unknown_error',
        message: body['message'] ?? 'Failed to find user',
      );
    }
  }

  Future<bool> sendFriendRequest(String currentUserId, String targetId) async {
    final response = await _post(
      '$_baseUrl/users/$currentUserId/friend-requests',
      {
        'targetId': targetId,
      },
    );

    final body = response.body.isNotEmpty ? jsonDecode(response.body) : {};

    if (response.statusCode == 200) {
      return true;
    } else {
      throw ApiError(
        type: body['code'] ?? 'unknown_error',
        message: body['message'] ?? 'Failed to send friend request',
      );
    }
  }

  Future<List<Map<String, dynamic>>> fetchFriendRequests(String currentUserId) async {
    final response = await _get('$_baseUrl/users/$currentUserId/friend-requests');
    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      final raw = body['friendRequests'] ?? [];
      if (raw is List) {
        return raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      }
      return [];
    } else {
      throw ApiError(
        type: body['code'] ?? 'unknown_error',
        message: body['message'] ?? 'Failed to fetch friend requests',
      );
    }
  }

  Future<bool> removeFriendRequest(
      String currentUserId,
      String targetId,
      String type,
      ) async {
    final response = await _delete(
      '$_baseUrl/users/$currentUserId/friend-requests?type=$type',
      {
        'targetId': targetId,
      },
    );

    final body = response.body.isNotEmpty ? jsonDecode(response.body) : {};

    if (response.statusCode == 200) {
      return true;
    } else {
      throw ApiError(
        type: body['code'] ?? 'unknown_error',
        message: body['message'] ?? 'Failed to remove friend request',
      );
    }
  }

  Future<bool> removeFriend(String currentUserId, String targetId) async {
    final response = await _delete(
      '$_baseUrl/users/$currentUserId/friends',
      {
        'targetId': targetId,
      },
    );

    final body = response.body.isNotEmpty ? jsonDecode(response.body) : {};

    if (response.statusCode == 200) {
      return true;
    } else {
      throw ApiError(
        type: body['code'] ?? 'unknown_error',
        message: body['message'] ?? 'Failed to remove friend',
      );
    }
  }

  Future<List<Map<String, dynamic>>> fetchConversations(
      String currentUserId, {
        String search = '',
      }) async {
    final response = await _get(
      '$_baseUrl/users/$currentUserId/conversations?search=${Uri.encodeQueryComponent(search)}',
    );

    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      final raw = body['conversations'] ?? [];
      if (raw is List) {
        return raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      }
      return [];
    } else {
      throw ApiError(
        type: body['code'] ?? 'unknown_error',
        message: body['message'] ?? 'Failed to fetch conversations',
      );
    }
  }

  Future<List<Map<String, dynamic>>> fetchConversationMessages(
      String currentUserId,
      String conversationId,
      ) async {
    final response = await _get(
      '$_baseUrl/users/$currentUserId/conversations/$conversationId/messages',
    );

    final body = jsonDecode(response.body);

    if (response.statusCode == 200) {
      final raw = body['messages'] ?? [];
      if (raw is List) {
        return raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      }
      return [];
    } else {
      throw ApiError(
        type: body['code'] ?? 'unknown_error',
        message: body['message'] ?? 'Failed to fetch messages',
      );
    }
  }

  Future<http.Response> _post(String url, Map<String, dynamic> body) async {
    return await _fetch('post', url, body);
  }

  Future<http.Response> _get(String url) async {
    return await _fetch('get', url, {});
  }

  Future<http.Response> _delete(String url, Map<String, dynamic> body) async {
    return await _fetch('delete', url, body);
  }

  Future<http.Response> _fetch(
      String type,
      String url,
      Map<String, dynamic> body,
      ) async {
    final headers = {
      'Content-Type': 'application/json',
      'Origin': dotenv.env['ALLOW_ORIGIN']!,
      if (_token != null) 'Authorization': 'Bearer $_token',
    };

    final jsonBody = jsonEncode(body);

    if (type == 'post') {
      return await http.post(Uri.parse(url), headers: headers, body: jsonBody);
    } else if (type == 'get') {
      return await http.get(Uri.parse(url), headers: headers);
    } else if (type == 'delete') {
      return await http.delete(Uri.parse(url), headers: headers, body: jsonBody);
    } else {
      return http.Response("{}", 500);
    }
  }

  Future<bool> sendMessage(
      String currentUserId,
      String conversationId,
      String content,
      ) async {
    final response = await _post(
      '$_baseUrl/users/$currentUserId/conversations/$conversationId/messages',
      {
        'content': content,
      },
    );

    final body = response.body.isNotEmpty ? jsonDecode(response.body) : {};

    if (response.statusCode == 200 || response.statusCode == 201) {
      return true;
    } else {
      throw ApiError(
        type: body['code'] ?? 'unknown_error',
        message: body['message'] ?? 'Failed to send message',
      );
    }
  }
}