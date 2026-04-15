import 'package:flutter/material.dart';
import 'package:latticechat/pages/login.dart';
import 'package:latticechat/pages/account.dart';

/// The appropriate intent, when passed to a ChangePasswordPage state will
/// result in different options being available to the user.
/// Read into ChangePasswordPage for more information on how they're handled
enum ChangeIntent {
  forgot,   // self explanatory
  manual,  // user choice
  enforced, // expired password
}

/// Call ChangePasswordPage's factory constructors where appropriate.
class ChangePasswordPage extends StatefulWidget {
  final ChangeIntent intent;
  final String? email;
  
  /// DO NOT ATTEMPT TO CALL THIS CONSTRUCTOR DIRECTLY — USE THE FACTORIES.
  const ChangePasswordPage._({super.key, required this.intent, this.email});

  /// Called by Forgot Password on the Login page
  factory ChangePasswordPage.forgot() {
    return ChangePasswordPage._(intent: ChangeIntent.forgot);
  }
  /// Called by Change Password on the user's Account page
  factory ChangePasswordPage.account(String email) {
    return ChangePasswordPage._(intent: ChangeIntent.manual, email: email);
  }
  /// Called by successful Sign In with a recently expired password
  factory ChangePasswordPage.enforced(String email) {
    return ChangePasswordPage._(intent: ChangeIntent.enforced, email: email);
  }

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  @override
  Widget build(BuildContext context) {
    return const Placeholder();
  }
}