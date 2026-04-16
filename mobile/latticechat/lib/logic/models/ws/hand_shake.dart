class InitHandShake {
  final String jwt;
  final String userId;

  InitHandShake({
    required this.jwt,
    required this.userId
  });

  Map<String, dynamic> toJson() => {
    'jwt': jwt,
    'id': userId
  };
}