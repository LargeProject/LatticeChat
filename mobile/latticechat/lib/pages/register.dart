import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'package:tailwind_flutter/tailwind_flutter.dart';
import 'package:flutter_debouncer/flutter_debouncer.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmationController = TextEditingController();

  final Debouncer _emailDebouncer = Debouncer();
  final Debouncer _usernameDebouncer = Debouncer();

  String _emailStatus = '';
  String _usernameStatus = '';
  String _passwordStatus = '';
  String _confirmationStatus = '';
  
  @override
  void dispose() {
    _emailDebouncer.cancel;
    _usernameDebouncer.cancel;
    _emailController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmationController.dispose();
    super.dispose();
  }
  
  // A function meant to be called by the Sign Up button
  void _handleSignUp() {
    debugPrint('Sign Up button was pressed');
  }

  void _handleHaveAccount() {
    debugPrint('Already Have Account button was pressed');
  }

  void onEmailChanged(String email) {
    debugPrint('Email has been changed');
    debugPrint(email);
  }

  void onUsernameChanged(String user) {
    debugPrint('Username has been changed');
    debugPrint(user);
  }

  void onPasswordChanged(String pass) {
    debugPrint('Password has been changed');
  }

  void onConfirmChanged(String conf) {
    debugPrint('Confirming Password has been changed');
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

                  TextField(
                    controller: _emailController,
                    onChanged: (email) => onEmailChanged(email),
                    decoration: InputDecoration(
                      labelText: 'Email',
                    ),
                  ),

                  const SizedBox(height: 16),

                  Text(_emailStatus),

                  const SizedBox(height: 16),

                  TextField(
                    controller: _usernameController,
                    onChanged: (user) => onUsernameChanged(user),
                    decoration: InputDecoration(
                      labelText: 'Username',
                    ),
                  ),

                  const SizedBox(height: 16),

                  Text(_usernameStatus),

                  const SizedBox(height: 16),

                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    onChanged: (pass) => onPasswordChanged(pass),
                    decoration: InputDecoration(
                      labelText: 'Password',
                    ),
                  ),

                  const SizedBox(height: 16),

                  Text(_passwordStatus),

                  const SizedBox(height: 16),

                  TextField(
                    controller: _confirmationController,
                    obscureText: true,
                    onChanged: (conf) => onConfirmChanged(conf),
                    decoration: InputDecoration(
                      labelText: 'Confirm Password',
                    ),
                  ),

                  const SizedBox(height: 16),

                  Text(_confirmationStatus),

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