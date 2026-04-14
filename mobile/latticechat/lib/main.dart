import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:latticechat/theme.dart';
import 'package:latticechat/pages/login.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await dotenv.load(fileName: ".env");
    print(dotenv.env['API_BASE_URL']);
    print(dotenv.env['ALLOW_ORIGIN']);
  } catch (e) {
    throw Exception('Error loading .env file: $e');
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LatticeChat',
      theme: darkTheme,
      debugShowCheckedModeBanner: false,
      home: const LoginPage(),
    );
  }
}