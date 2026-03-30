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