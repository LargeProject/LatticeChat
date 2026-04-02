import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'pages/login.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(

      title: 'LatticeChat Login',
      theme: darkTheme,
      home: const LoginPage(),
    );
  }
}