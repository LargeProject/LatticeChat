bool isValidEmail(String email) {
  final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
  return regex.hasMatch(email);
}

bool isValidUsername(String username) {
  final regex = RegExp(r'^[a-zA-Z0-9_.]{3,}$');
  return regex.hasMatch(username);
}