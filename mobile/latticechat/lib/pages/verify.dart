import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'package:latticechat/logic/api.dart';
import 'package:latticechat/logic/models/error.dart';
import 'package:pinput/pinput.dart';


class VerifyPage extends StatefulWidget {
  const VerifyPage({super.key});

  @override
  State<VerifyPage> createState() => _VerifyPageState();
}

class _VerifyPageState extends State<VerifyPage> {
  final TextEditingController _pinController = TextEditingController();

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  // A function meant to be called by the PInput or Verify button
  Future<void> _handleVerify() async {
    final pin = _pinController.text;

    if (pin.length != 6) return;

    // TODO: Replace with the actual API call
    debugPrint('Verifying code: $pin');

    // On success, go to landing page
    // TODO: Add landing page transfer (will need to pass session ID or smth)
  }
  
  @override
  Widget build(BuildContext context) {
    // Theme for each of the pin squares
    PinTheme defaultPinTheme = PinTheme(
      width: 40,
      height: 40,
      textStyle: TextStyle(fontSize: 20, fontWeight: FontWeight.w400, color: primaryColor),
      decoration: BoxDecoration(
        color: backgroundColor,
        border: Border.all(color: primaryColor),
        borderRadius: BorderRadius.circular(4),
      ),
    );

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [

            secondaryGradientText(context, 'Verify Your Email'),

            const SizedBox(height: 16),

            Text(
              'Enter the 6-digit code we emailed you to confirm your address and complete your sign up.',
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 16),

            Container(
              width: 350,
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 24),
              decoration: AppContainerStyles.genericBox,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [

                  Pinput(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    length: 6,
                    controller: _pinController,
                    onCompleted: (value) => _handleVerify(),
                    onChanged: (value) {setState(() {});},
                    defaultPinTheme: defaultPinTheme,
                    // Style the focused field to have a green border
                    focusedPinTheme: defaultPinTheme.copyWith(
                      decoration: defaultPinTheme.decoration!.copyWith(
                        border: Border.all(color: goodboyGreen, width: 2),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  ElevatedButton(
                    onPressed: _pinController.text.length == 6 ? _handleVerify : null,
                    style: AppButtonStyles.secondaryElevated,
                    child: const Text('Verify code')
                  ),

                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}