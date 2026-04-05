class ApiError implements Exception {
  final String type;
  final String message;

  ApiError({required this.type, required this.message});

  @override
  String toString() {
    return '$type: $message';
  }
}