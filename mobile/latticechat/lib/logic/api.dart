import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:latticechat/logic/models/error.dart';
import 'package:latticechat/logic/models/response.dart';

class ApiServices {
  static final String _baseUrl = dotenv.env['API_BASE_URL']!;

  Future<bool> attemptSignUp(String username, String email, String password) async {
    final response = await _post('$_baseUrl/auth/sign-up/email', {
      'name': username,
      'email': email,
      'password': password
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      Map<String, dynamic> body = jsonDecode(response.body);
      throw ApiError(type: body['code'], message: body['message']);
    }
  }

  Future<SignInResponse> attemptSignIn(String email, String password) async {
    final response = await _post('$_baseUrl/auth/sign-in/email', {
      'email': email,
      'password': password
    });

    final body = jsonDecode(response.body);
    body['jwt'] = response.headers['set-auth-token'];

    if (response.statusCode == 200) {
      return SignInResponse.fromJson(body)!;
    } else {
      throw ApiError(type: body['code'], message: body['message']);
    }
  }

  Future<bool> attemptSendEmailVerification(String email) async {
    final response = await _post(
        '$_baseUrl/auth/email-otp/send-verification-otp', {
      'email': email,
      'type': 'email-verification'
    });

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
      'otp': code
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError(type: body['code'], message: body['message']);
    }
  }

  Future<http.Response> _post(String url, Map<String, dynamic> body) async {
    return await _fetch("post", url, body);
  }

  Future<http.Response> _get(String url) async {
    return await _fetch("post", url, {});
  }

  Future<http.Response> _fetch(String type, String url, Map<String, dynamic> body) async {
    final headers = {
      'Content-Type': 'application/json',
      'Origin': dotenv.env['ALLOW_ORIGIN']!
    };
    final jsonBody = jsonEncode(body);

    if(type == "post") {
      return await http.post(Uri.parse(url), headers: headers, body: jsonBody);
    } else if(type == "get")
      return await http.get(Uri.parse(url), headers: headers);
    else
      return http.Response("{}", 500);
  }
}