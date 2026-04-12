import 'dart:convert';

import '../util/error.dart';
import '../response.dart';
import '../util/http.dart';

class AuthServices {
  final String _baseUrl;

  AuthServices(this._baseUrl);

  Future<bool> signUp(String username, String email, String password) async {
    final response = await HttpUtil.sendPost('$_baseUrl/auth/sign-up/email', {
      'name': username,
      'email': email,
      'password': password
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }

  Future<SignInResponse> signIn(String email, String password) async {
    final response = await HttpUtil.sendPost('$_baseUrl/auth/sign-in/email', {
      'email': email,
      'password': password
    });

    final body = jsonDecode(response.body);
    body['jsonWT'] = response.headers['set-auth-token'];

    if (response.statusCode == 200) {
      return SignInResponse.fromJson(body)!;
    } else {
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> sendEmailVerification(String email) async {
    final response = await HttpUtil.sendPost('$_baseUrl/auth/email-otp/send-verification-otp', {
      'email': email,
      'type': 'email-verification'
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> verifyEmail(String email, String code) async {
    final response = await HttpUtil.sendPost('$_baseUrl/auth/email-otp/verify-email', {
      'email': email,
      'otp': code
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> sendPasswordResetVerification(String email) async {
    final response = await HttpUtil.sendPost('$_baseUrl/auth/email-otp/request-password-reset', {
      'email': email
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> resetPassword(String email, String code, String password) async {
    final response = await HttpUtil.sendPost('$_baseUrl/auth/email-otp/reset-password', {
      'email': email,
      'otp': code,
      'password': password
    });

    if (response.statusCode == 200) {
      return true;
    } else {
      final body = jsonDecode(response.body);
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> isUsernameAvailable(String username) async {
    final response = await HttpUtil.sendGet('$_baseUrl/auth/username-taken?username=$username');
    final body = jsonDecode(response.body);

    if(response.statusCode == 200) {
      return !body['isTaken'];
    } else {
      throw ApiError.fromBody(body);
    }
  }

  Future<bool> isEmailAvailable(String email) async {
    final response = await HttpUtil.sendPost('$_baseUrl/auth/email-taken', {
      email: email
    });
    final body = jsonDecode(response.body);

    if(response.statusCode == 200) {
      return !body['isTaken'];
    } else {
      throw ApiError.fromBody(body);
    }
  }
}