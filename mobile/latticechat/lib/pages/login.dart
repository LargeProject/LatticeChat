import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'package:latticechat/pages/register.dart';
import 'package:latticechat/pages/verify.dart';
import 'package:latticechat/pages/chat_list.dart';

import '../logic/services/api.dart';
import '../logic/util/error.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

// TODO: Link the pages with their respective buttons

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // A function meant to be called by the Sign In button
  void _handleLogin() async {

    final email = _emailController.text;
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) { // you forgot something
      debugPrint('Sign In button was pressed with a field missing');
      return;
    }

    try {
      final authApi = ApiServices.getAuthServices();
      final response = await authApi.signIn(email, password);
      final jsonWT = response.jsonWT;

      debugPrint('Sign in successful!');

      // Send user to ChatListPage (with their information attached?)
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => ChatListPage(jwt: jsonWT)),
      );

    } on ApiError catch (error) {
      debugPrint(error.toString());
      switch (error.type) {
        case "EMAIL_NOT_VERIFIED":
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => VerifyPage(email: email)),
          );
        case "INVALID_EMAIL_OR_PASSWORD":
          // Display message somehow. Maybe a toast for simplicity.
      }
    }
  }

  // A function meant to be called by the Forgot Password button
  void _handleForgotPass() {
    debugPrint('Forgot Pass button was pressed');
  }

  // A function meant to be called by the No Account button
  void _handleNoAccount() {
    debugPrint('No Account button was pressed');

    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => RegisterPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [

            // Animated Gradient Text title from theme.dart
            primaryGradientText(context, 'Welcome Back'),

            const SizedBox(height: 16),

            Text(
              'Sign in to continue your encrypted chats',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            
            const SizedBox(height: 16),

            Container(  // Login label
              width: 300,
              padding: EdgeInsets.fromLTRB(16, 32, 16, 8),
              decoration: AppContainerStyles.genericBox,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [

                  TextField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      labelText: 'Email',
                    ),
                  ),
                  
                  const SizedBox(height: 16),

                  TextField(
                    controller: _passwordController,
                    obscureText: true,  // cuz it's a password
                    decoration: InputDecoration(
                      labelText: 'Password',
                    ),
                  ),

                  const SizedBox(height: 16),

                  ElevatedButton(
                    onPressed: _handleLogin,
                    style: AppButtonStyles.primaryElevated,
                    child: const Text('Sign In'),
                  ),

                  const SizedBox(height: 8),

                  TextButton(
                    onPressed: _handleForgotPass,
                    child: const Text('Forgot Password?')
                  ),
                ],
              ),
            ),

            TextButton(
              onPressed: _handleNoAccount,
              child: const Text('Don\'t have an account? Sign up')
            ),
          ],
        ),
      ),
    );
  }
}