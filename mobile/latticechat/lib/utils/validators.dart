import 'package:latticechat/theme.dart';
import 'package:latticechat/utils/severity.dart';

/// Validator signature: returns null if valid, otherwise an error message.
/// All error messages are formatted as Strings.
typedef ValueValidator = StatusMessage? Function(String value);

/// Always passes validation; always returns null.
StatusMessage? alwaysValid(String value) => null;

/// Email must follow standard formatting.
/// Returns null if the email is valid, otherwise returns an error message.
StatusMessage? emailValidator(String email) {
final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
  if (!regex.hasMatch(email)) {
    return StatusMessage(
      message: 'Invalid email address formatting',
      severity: Severity.major
    );
  }
  return null;
}

/// Username must be between 3-20 chars, letters, numbers, underscore, and dot.
/// Returns null if the username is valid, otherwise returns an error message.
StatusMessage? usernameValidator(String username) {
  if (username.length < 3 || username.length > 20) {
    return StatusMessage(
      message: 'Username must be between 3-20 characters',
      severity: Severity.minor
    );
  }
  final regex = RegExp(r'^[a-zA-Z0-9_.]{3,}$');
  if (!regex.hasMatch(username)) {
    return StatusMessage(
      message: 'Username may only contain letters, numbers, underscore (_), and dot (.)',
      severity: Severity.major
    );
  }
  return null;
}