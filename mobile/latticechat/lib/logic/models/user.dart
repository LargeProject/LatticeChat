class UserModel {
  final String id;
  final String username;
  final bool emailVerified;

  UserModel._({
    required this.id,
    required this.username,
    required this.emailVerified,
  });

  static UserModel fromJson(Map<String, dynamic> json) {
    return UserModel._(
      id: (json['id'] ?? '').toString(),
      username: (json['username'] ?? json['name'] ?? '').toString(),
      emailVerified: json['emailVerified'] ?? false,
    );
  }
}