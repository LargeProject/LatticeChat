import 'package:latticechat/logic/models/user.dart';

class SignInResponse {
  final UserModel user;
  final String jsonWT;

  SignInResponse._({required this.user, required this.jsonWT});

  static SignInResponse? fromJson(Map<String, dynamic> json) {
    return SignInResponse._(
        user: UserModel.fromJson(json['user']),
        jsonWT: json['jsonWT']
    );
  }

}