import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            
            primaryGradientText(context, 'Success!'),

            const SizedBox(height: 16),

            Text(
              'This is a temporary landing page.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),

          ]
        )
      )
    );
  }
}