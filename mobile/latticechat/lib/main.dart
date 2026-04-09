import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:latticechat/theme.dart';
// Pages
//import 'package:latticechat/pages/login.dart'; // add this back in as the landing page when done(?)
import 'package:latticechat/pages/register.dart';

void main() async {
  await dotenv.load(fileName: ".env");
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(

      title: 'LatticeChat Login',
      theme: darkTheme,
      home: const RegisterPage(), // <-- We swap this out when we're testing a page
    );
  }
}
/*
my test main file, used for testing pages in isolation. This is not the actual entry point of the app, which is in login.dart
import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'pages/chatList.dart';

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