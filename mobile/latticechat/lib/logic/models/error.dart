class ApiError implements Exception {
  final String type;
  final String message;

  ApiError({required this.type, required this.message});

  String toString() {
    return '$type: $message';
  }
}