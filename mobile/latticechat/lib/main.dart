import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
// Pages
import 'package:latticechat/pages/login.dart';
import 'package:latticechat/pages/register.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(

      title: 'LatticeChat Login',
      theme: darkTheme,
      home: const RegisterPage(),
    );
  }
}