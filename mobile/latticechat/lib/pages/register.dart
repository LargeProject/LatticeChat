import 'package:flutter/material.dart';
import 'package:latticechat/logic/api.dart';
import 'dart:async';
import 'package:latticechat/theme.dart';
import 'package:latticechat/widgets/debounced_validation_field.dart';
import 'package:latticechat/widgets/password_validation_field.dart';
import 'package:latticechat/widgets/confirm_password_field.dart';
import 'package:latticechat/utils/validators.dart';
import 'package:latticechat/logic/models/error.dart';
import 'package:latticechat/pages/login.dart';
import 'package:latticechat/pages/verify.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmationController = TextEditingController();

  String _email = '';
  String _username = '';
  String _password = '';

  bool _isEmailValid = false;
  bool _isUsernameValid = false;
  bool _isPasswordValid = false;
  bool _isConfirmValid = false;

  bool get _isFormValid => _isEmailValid &&
                        _isUsernameValid &&
                        _isPasswordValid &&
                        _isConfirmValid;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmationController.dispose();
    super.dispose();
  }

  Future<bool> checkEmailAvailability(String email) async {
    final api = ApiServices();
    return !await api.isEmailTaken(email);
  }

  Future<bool> checkUsernameAvailability(String username) async {
    final api = ApiServices();
    return !await api.isEmailTaken(username);
  }
  
  // A function meant to be called by the Sign Up button
  // TODO: Make status messages flicker when submitted with an invalid field?
  // TODO: Display some kind of error when the API call fails.
  void _handleSignUp() async {
    if (!_isFormValid) {
      debugPrint('Sign Up button was pressed with an invalid form. Do nothing');
      return;
    }

    // All fields should be valid and available from in here down
    try {
      final api = ApiServices();

      if (!await api.attemptSignUp(_username, _email, _password)) {
        debugPrint("Sign up unsuccessful, check information.");
        return;
      }
      debugPrint("Sign up successful!");

      if (!await api.attemptSendEmailVerification(_email)) {
        debugPrint("Failed to send email verification code, check information.");
        return;
      }
      debugPrint("Sent email verification code. Proceeding to Verify page...");

      // Switches to the Verify page and passes the email
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => VerifyPage(email: _email),
        ),
      );

    } on ApiError catch (error) {
      debugPrint(error.toString());
      return;
    }
  }

  // A function meant to be called by the Already Have Account button
  void _handleHaveAccount() {
    debugPrint('Already Have Account button was pressed');

    // Temporary page navigation
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => LoginPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [

            primaryGradientText(context, 'Create Account'),

            const SizedBox(height: 8),

            Text(
              'Join to speak freely.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),

            const SizedBox(height: 16),

            Container(  // Registration label
              width: 300,
              padding: EdgeInsets.fromLTRB(16, 24, 16, 16),
              decoration: AppContainerStyles.genericBox,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [

                  DebouncedValidationField(
                    label: 'Email',
                    validator: emailValidator,
                    availabilityChecker: checkEmailAvailability,
                    onValueChanged: (value) => _email = value,
                    onValidationChanged: (isValid) => setState(() => _isEmailValid = isValid),
                    emptyMessage: "Email is required",
                  ),

                  const SizedBox(height: 16),

                  DebouncedValidationField(
                    label: 'Username',
                    validator: usernameValidator,
                    availabilityChecker: checkUsernameAvailability,
                    onValueChanged: (value) => _username = value,
                    onValidationChanged: (isValid) => setState(() => _isUsernameValid = isValid),
                    emptyMessage: "Username is required",
                  ),

                  const SizedBox(height: 16),

                  PasswordField(
                    label: "Password",
                    onValueChanged: (value) => _password = value,
                    onValidationChanged: (isValid) => setState(() => _isPasswordValid = isValid),
                  ),

                  const SizedBox(height: 16),

                  ConfirmPasswordField(
                    label: "Confirm Password",
                    password: _password, // passes current password
                    onValidationChanged: (isValid) => setState(() => _isConfirmValid = isValid),
                  ),

                  const SizedBox(height: 16),

                  ElevatedButton(
                    onPressed: _isFormValid ? _handleSignUp : null,
                    style: AppButtonStyles.primaryElevated,
                    child: const Text('Sign Up')
                  )
                ],
              ),
            ),
            TextButton(
              onPressed: _handleHaveAccount,
              child: const Text('Already have an account? Sign in')
            )
          ],
        )
      )
    );
  }
}