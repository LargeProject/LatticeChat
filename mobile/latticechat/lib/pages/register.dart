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

  // Simulated API checks
  Future<bool> checkEmailAvailability(String email) async {
    await Future.delayed(Duration(milliseconds: 500));
    return !email.contains('test');
  }

  Future<bool> checkUsernameAvailability(String username) async {
    await Future.delayed(Duration(milliseconds: 500));
    return !username.contains('admin');
  }
  
  // A function meant to be called by the Sign Up button
  // TODO: Consider adding a flicker effect when submitted with an invalid field
  void _handleSignUp() async {
    if (!_isFormValid) {
      debugPrint('Sign Up button was pressed with an invalid form. Do nothing');
      return;
    }

    // All fields should be valid and available from in here down
    try {
      final api = ApiServices();
      await api.attemptSignUp(_username, _email, _password);
      debugPrint("Sign up successful!");

      await api.attemptSendEmailVerification(_email);
      debugPrint("Sent email verification code");

    } on ApiError catch (error) {
      debugPrint(error.toString());
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

            titleGradientText(context, 'Create Account'),

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
                    validator: isValidEmail,
                    availabilityChecker: checkEmailAvailability,
                    onValueChanged: (value) => _email = value,
                    onValidationChanged: (isValid) => setState(() => _isEmailValid = isValid),
                  ),

                  const SizedBox(height: 16),

                  DebouncedValidationField(
                    label: 'Username',
                    validator: isValidUsername,
                    availabilityChecker: checkUsernameAvailability,
                    onValueChanged: (value) => _username = value,
                    onValidationChanged: (isValid) => setState(() => _isUsernameValid = isValid),
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
                    onPressed: _handleSignUp,
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