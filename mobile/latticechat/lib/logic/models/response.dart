import 'package:latticechat/logic/models/user.dart';

class SignInResponse {
  final UserModel user;
  final String jwt;

  SignInResponse._({required this.user, required this.jwt});

  static SignInResponse? fromJson(Map<String, dynamic> json) {
    return SignInResponse._(
        user: UserModel.fromJson(json['user']),
        jwt: json['jwt']
    );
  }

}