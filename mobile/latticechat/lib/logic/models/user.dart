class UserModel {

  final String id;
  final String username;
  final bool emailVerified;
  // TODO: add more attributes later...

  UserModel._({
    required this.id,
    required this.username,
    required this.emailVerified
});

  static UserModel fromJson(Map<String, dynamic> json) {
    return UserModel._(
      id: json['id'],
      username: json['username'],
      emailVerified: json['emailVerified']
    );
  }
}