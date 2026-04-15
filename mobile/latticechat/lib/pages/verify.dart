import 'package:flutter/material.dart';
import 'package:latticechat/pages/login.dart';
import 'package:latticechat/theme.dart';
import 'package:pinput/pinput.dart';

import '../logic/services/api.dart';
import '../logic/util/error.dart';


class VerifyPage extends StatefulWidget {
  final String email;
  const VerifyPage({super.key, required this.email});

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

    debugPrint('Attempting to verify with code: $pin and email: ${widget.email}');

    try {
      final authApi = ApiServices.getAuthServices();

      // This API call needs to be modified, because I want the session ID--not just a boolean
      final response = await authApi.verifyEmail(widget.email, pin);
      
      // Switches to the Login page
      if (response) {   
        debugPrint("Verification successful. Proceeding to Login page...");
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => LoginPage(),
          ),
        );
      } else {
        debugPrint("Verification unsuccessful, ensure you have the correct code");
        // TODO: Indicate to the user that it failed
        return;
      }
      
    } on ApiError catch (error) {
      debugPrint(error.toString());
    }
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