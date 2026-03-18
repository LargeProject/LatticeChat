import 'package:flutter/material.dart';
import 'pages/login.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(

      title: 'LatticeChat Login',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Color(0xFF272E33),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Colors.white),  // this shows up in the text boxes
          bodyMedium: TextStyle(color: Colors.purple),  // this shows up in the dialog
          bodySmall: TextStyle(color: Colors.red),  // idk where this shows up
        ),
        textSelectionTheme: TextSelectionThemeData(
          cursorColor: Colors.white,    // This is the cursor bar
          selectionColor: Color(0x2200FF80),   // This is the text highlight
          selectionHandleColor: Color(0xDD00FF80),  // These are the guitar picks
        )
      ),
      home: const LoginPage(),
    );
  }
}