import 'package:flutter/material.dart';
import 'package:latticechat/pages/login.dart';
import 'package:latticechat/pages/chat_list.dart';
import 'package:latticechat/pages/change_password.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key, required String jwt});

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  @override
  Widget build(BuildContext context) {
    return const Placeholder();
  }
}