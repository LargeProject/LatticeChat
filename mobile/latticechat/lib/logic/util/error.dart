class ApiError implements Exception {
  final String type;
  final String message;

  ApiError({required this.type, required this.message});

  ApiError.fromBody(Map<String, dynamic> body) : this(type: body['code'], message: body['message']);

  @override
  String toString() {
    return '$type: $message';
  }
}