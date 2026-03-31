import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
// Pages
// import 'package:latticechat/pages/login.dart'; // add this back in as the landing page when done(?)
import 'package:latticechat/pages/register.dart'; // temporary until we handle page changes

void main() => runApp(const MyApp());

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