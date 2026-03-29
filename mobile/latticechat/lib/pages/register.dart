import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'package:tailwind_flutter/tailwind_flutter.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}



class _RegisterPageState extends State<RegisterPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }
  
  // A function meant to be called by the Sign Up button
  void _handleSignUp() {
    debugPrint('Sign Up button was pressed');
  }

  void _handleHaveAccount() {
    debugPrint('Already Have Account button was pressed');
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
                    decoration: InputDecoration(
                      labelText: 'Email',
                    ),
                  ),

                  const SizedBox(height: 16),

                  TextField(
                    controller: _usernameController,
                    decoration: InputDecoration(
                      labelText: 'Username',
                    ),
                  ),

                  const SizedBox(height: 16),

                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Password',
                    ),
                  ),

                  const SizedBox(height: 16),

                  TextField(
                    controller: _confirmController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Confirm Password',
                    ),
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