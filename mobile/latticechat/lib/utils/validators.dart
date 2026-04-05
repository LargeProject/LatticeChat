bool isValidEmail(String email) {
  final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
  return regex.hasMatch(email);
}

bool isValidUsername(String username) {
  final regex = RegExp(r'^[a-zA-Z0-9_.]{3,}$');
  return regex.hasMatch(username);
}

enum PasswordStrength { weak, medium, strong }

PasswordStrength evaluatePasswordStrength(String password) {
  int score = 0;
  if (password.length >= 8) score++;
  if (password.contains(RegExp(r'[A-Z]'))) score++;
  if (password.contains(RegExp(r'[a-z]'))) score++;
  if (password.contains(RegExp(r'[0-9]'))) score++;
  if (password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) score++;
  
  if (score <= 2) return PasswordStrength.weak;
  if (score <= 4) return PasswordStrength.medium;
  return PasswordStrength.strong;
}