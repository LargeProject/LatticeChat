import 'package:flutter/material.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

/*  TODO:
*   There are a ton of things that need to be moved into
*   some kinda theme/css-like file. We should probably create
*   basic assets for text input, circular symbol buttons,
*   text buttons, sizable fake "glass" labels, and
*   anything else you can think of tbh.
*   It'd be a good idea to move the theme info from main.dart
*   into there as well since that stuff should be universal.
*   Also, these colors should probably go there, as commented.
*
*   TODO:
*   Gotta add a link to a registration.dart page somewhere
*   after the big box.
*/

// These should be moved into a theme file somewhere
const focusedColor = Color(0xFF34C759);   // for active toggles
const backgroundColor = Color(0xFF272E33);// offblack
const primaryColor = Color(0xFFE1E1E1);   // offwhite
const secondaryColor = Color(0xFFE2E2E2); // underwhite
const tertiaryColor = Color(0xFFA3A3A3);  // concrete
const goodboyGreen = Color(0xFF00FF80);   // for confirmations
const badboyRed = Color(0xFFC04A42);      // for errors

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // A function meant to be called by the Login button
  void _handleLogin() {
    final email = _emailController.text;
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) return; // you forgot something

    // Do something with the data – for now, just show a dialog
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Login Attempt'),
        content: Text('Email: $email\nPassword: $password'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  // This is the actual page content
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'LatticeChat',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: primaryColor),
            ),
            const SizedBox(height: 16),   // spacing before the big box (never through I'd miss android studio)
            Container(  // Login label
              width: 300,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(color: Color(0xFF878D92)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: _emailController,
                    decoration: InputDecoration(
                      labelText: 'Email',
                      labelStyle: TextStyle(color: primaryColor), // starting label color
                      floatingLabelStyle: TextStyle(color: focusedColor), // label color when selected
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: primaryColor),  // starting border color
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: focusedColor),  // border color when selected
                      ),
                      border: OutlineInputBorder(), // fallback
                    ),

                  ),
                  const SizedBox(height: 12),   // spacing before password
                  TextField(
                    controller: _passwordController,
                    obscureText: true,  // cuz it's a password
                    decoration: InputDecoration(
                      labelText: 'Password',
                      labelStyle: TextStyle(color: primaryColor),
                      floatingLabelStyle: TextStyle(color: focusedColor),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: primaryColor),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: focusedColor),
                      ),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 8),  // spacing before login button
                  ElevatedButton(
                    onPressed: _handleLogin,
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8), // rounded corners
                        side: BorderSide(color: Color(0xFF00FF80), width: 1),  // outline
                      ),
                      backgroundColor: const Color(0xFF272E33),
                      foregroundColor: Color(0xFF00FF80),
                    ),
                    child: const Text('Login'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}