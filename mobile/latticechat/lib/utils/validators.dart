/// Validator signature: returns null if valid, otherwise an error message.
/// All error messages are formatted as Strings.
typedef ValueValidator = String? Function(String value);

/// Always passes validation; always returns null.
String? alwaysValid(String value) => null;

/// Email must follow standard formatting.
/// Returns null if the email is valid, otherwise returns an error message.
String? emailValidator(String email) {
  final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
  if (!regex.hasMatch(email)) return 'Invalid email address formatting';

  return null;
}

/// Username must be between 3-20 chars, letters, numbers, underscore, and dot.
/// Returns null if the username is valid, otherwise returns an error message.
String? usernameValidator(String username) {
  if (username.length < 3 || username.length > 20) return 'Username must be between 3-20 characters';

  final regex = RegExp(r'^[a-zA-Z0-9_.]{3,}$');
  if (!regex.hasMatch(username)) return 'Username may only contain letters, numbers, underscore (_), and dot (.)';

  return null;
}