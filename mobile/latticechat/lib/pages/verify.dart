import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'package:latticechat/logic/api.dart';
import 'package:latticechat/logic/models/error.dart';


class VerifyPage extends StatefulWidget {
  const VerifyPage({super.key});

  @override
  State<VerifyPage> createState() => _VerifyPageState();
}

class _VerifyPageState extends State<VerifyPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            
            secondaryGradientText(context, 'Verify Your Email'),
            SizedBox(height: 16),

            Container(  // Verify label
              width: 350,
              padding: EdgeInsets.fromLTRB(16, 32, 16, 8),
              decoration: AppContainerStyles.darkBox,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [

                  Text(
                    'Enter the 6-digit code we emailed you to confirm your address and complete your sign up.',
                    style: Theme.of(context).textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),


                ]
              )
            ),

          ]
        )
      )
    );
  }
}