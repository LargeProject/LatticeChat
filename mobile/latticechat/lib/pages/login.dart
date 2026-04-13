import 'package:flutter/material.dart';
import 'package:latticechat/pages/register.dart';
import 'package:latticechat/pages/chat_list.dart';
import 'package:latticechat/logic/api.dart';
import 'package:latticechat/logic/models/error.dart';
import 'package:latticechat/theme.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter your email and password.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final api = ApiServices();
      final response = await api.attemptSignIn(email, password);

      debugPrint('Sign in successful!');
      debugPrint('User-id: ${response.user.id}');
      debugPrint('User-name: ${response.user.username}');
      debugPrint('JWT: ${response.jsonWT}');

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => ChatListPage(currentUser: response.user),
        ),
      );
    } on ApiError catch (error) {
      if (!mounted) return;

      setState(() {
        _errorMessage = error.message;
      });

      debugPrint(error.toString());
    } catch (error) {
      if (!mounted) return;

      setState(() {
        _errorMessage = 'Something went wrong while signing in.';
      });

      debugPrint(error.toString());
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _handleForgotPass() {
    debugPrint('Forgot Pass button was pressed');
  }

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
            primaryGradientText(context, 'Welcome Back'),
            const SizedBox(height: 16),
            Text(
              'Sign in to continue your encrypted chats',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            Container(
              width: 300,
              padding: const EdgeInsets.fromLTRB(16, 32, 16, 8),
              decoration: AppContainerStyles.genericBox,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Password',
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (_errorMessage != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.redAccent),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: AppButtonStyles.primaryElevated,
                    child: _isLoading
                        ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                        : const Text('Sign In'),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: _handleForgotPass,
                    child: const Text('Forgot Password?'),
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: _handleNoAccount,
              child: const Text('Don\'t have an account? Sign up'),
            ),
          ],
        ),
      ),
    );
  }
}