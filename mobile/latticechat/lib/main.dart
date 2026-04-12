import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:latticechat/theme.dart';
// Pages -- swap these out when testing pages
import 'package:latticechat/pages/login.dart';
//import 'package:latticechat/pages/register.dart';
//import 'package:latticechat/pages/verify.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // Ensure Flutter is initialized
  try {
    await dotenv.load(fileName: ".env"); // Load environment variables
  } catch (e) {
    throw Exception('Error loading .env file: $e'); // Print error if any
  }
  runApp(const MyApp()); // Runs the app
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(

      title: 'LatticeChat',
      theme: darkTheme,
      home: const LoginPage(), // <-- We swap this out when we're testing a page
    );
  }
}
/*
my test main file, used for testing pages in isolation. This is not the actual entry point of the app, which is in login.dart
import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'pages/chat_list.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LatticeChat',
      theme: darkTheme,
      home: const ChatListPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}
 */