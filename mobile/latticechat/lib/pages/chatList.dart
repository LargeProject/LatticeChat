import 'package:flutter/material.dart';
import 'openChat.dart';

class ChatListPage extends StatelessWidget {
  const ChatListPage({super.key});

  @override
  Widget build(BuildContext context) {
    final chats = [
      {
        "name": "Darren",
        "lastMessage": "See you later",
        "time": "2:14 PM",
      },
      {
        "name": "Alex",
        "lastMessage": "Did you finish it?",
        "time": "1:48 PM",
      },
      {
        "name": "Maria",
        "lastMessage": "Call me when you're free",
        "time": "11:32 AM",
      },
      {
        "name": "Jordan",
        "lastMessage": "I just sent the file",
        "time": "Yesterday",
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text("Messages"),
        centerTitle: false,
      ),
      body: ListView.separated(
        itemCount: chats.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final chat = chats[index];
          final name = chat["name"]!;
          final lastMessage = chat["lastMessage"]!;
          final time = chat["time"]!;

          return ListTile(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 8,
            ),
            leading: CircleAvatar(
              radius: 24,
              child: Text(
                name[0],
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            title: Text(
              name,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                lastMessage,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            trailing: Text(
              time,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => OpenChatPage(otherUserName: name),
                ),
              );
            },
          );
        },
      ),
    );
  }
}