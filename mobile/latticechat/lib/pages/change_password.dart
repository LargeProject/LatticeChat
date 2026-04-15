import 'package:flutter/material.dart';
import 'package:latticechat/logic/services/api.dart';
import 'package:latticechat/pages/login.dart';
import 'package:latticechat/theme.dart';
import 'package:pinput/pinput.dart';
import 'package:latticechat/widgets/password_validation_field.dart';
import 'package:latticechat/widgets/confirm_password_field.dart';
import 'package:latticechat/utils/validators.dart';
import 'package:latticechat/logic/util/error.dart';
import 'package:latticechat/widgets/debounced_validation_field.dart';
import 'package:latticechat/utils/severity.dart';

/// The appropriate intent, when passed to a ChangePasswordPage state will
/// result in different options being available to the user.
/// Read into ChangePasswordPage for more information on how they're handled
enum ChangeIntent {
  forgot,   // self explanatory
  manual,   // user choice
  enforced, // expired password
}

/// Call ChangePasswordPage's factory constructors where appropriate.
class ChangePasswordPage extends StatefulWidget {
  final ChangeIntent intent;
  final String? email;
  final String? jsonWT;
  
  /// DO NOT ATTEMPT TO CALL THIS CONSTRUCTOR DIRECTLY — USE THE FACTORIES.
  const ChangePasswordPage._({required this.intent, this.email, this.jsonWT});

  /// Called by Forgot Password on the Login page
  factory ChangePasswordPage.forgot() {
    return ChangePasswordPage._(intent: ChangeIntent.forgot);
  }
  /// Called by Change Password on the user's Account page
  factory ChangePasswordPage.manual(String jsonWT) {
    return ChangePasswordPage._(intent: ChangeIntent.manual, jsonWT: jsonWT);
  }
  /// Called by successful Sign In with a recently expired password
  factory ChangePasswordPage.enforced(String email) {
    return ChangePasswordPage._(intent: ChangeIntent.enforced, email: email);
  }

  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  // Controllers
  final TextEditingController _oldPasswordController = TextEditingController();
  final TextEditingController _pinController = TextEditingController();
  
  // Forgot mode – email handled by DebouncedValidationField
  String _email = '';
  bool _isEmailValidForReset = false;
  
  // Password field values and validation flags
  String _newPassword = '';

  bool _isNewPasswordValid = false;
  bool _isConfirmValid = false;
  bool _isOldPasswordValid = false;   // required for manual
  
  // Forgot‑specific state
  bool _isCodeRequested = false;      // email locked and code sent
  bool _isLoading = false;
  
  // Pin completion flag
  bool _isPinComplete = false;
  
  // Check if basic password fields are ready (enforced/forgot after lock)
  bool get _arePasswordFieldsValid => _isNewPasswordValid && _isConfirmValid;
  
  // Check if ALL password fields are ready (manual only)
  bool get _areManualFieldsValid =>
      _isOldPasswordValid && _isNewPasswordValid && _isConfirmValid;

  @override
  void initState() {
    super.initState();
    // Pre‑fill email if provided (enforced only) and auto‑request code
    if (widget.email != null) {
      _email = widget.email!;
      // For enforced, we assume email exists (user just logged in)
      _isEmailValidForReset = true;
      _requestCode();
    }
  }

  @override
  void dispose() {
    _oldPasswordController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  // ---------- API calls ----------
  
  /// Checks email existence on server (used by DebouncedValidationField)
  Future<bool> checkEmailExists(String email) async {
    final authApi = ApiServices.getAuthServices();
    return !await authApi.isEmailAvailable(email);
  }
  
  Future<void> _requestCode() async {
    if (!_isEmailValidForReset) return;
    
    setState(() => _isLoading = true);

    try {
      final authApi = ApiServices.getAuthServices();
      final result = await authApi.sendPasswordResetVerification(_email);

      if (!result) {
        debugPrint('Request failed, info must\'ve been wrong somehow');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to send code. Please try again.'),
              backgroundColor: Colors.white,
            ),
          );
          setState(() => _isLoading = false);
          return;
        }
      }

      // On success, lock the email and show the pin + password fields
      setState(() {
        _isCodeRequested = true;
        _isLoading = false;
      });

    } on ApiError catch (error) {
      debugPrint(error.toString());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error.toString()),
            backgroundColor: Colors.white,
          ),
        );
      }
      setState(() => _isLoading = false);
    }
  }
  
  // Handled by the "Change Password" button called by a manual change
  Future<void> _handleManualSubmit() async {
    if (!_areManualFieldsValid) return;
    final oldPassword = _oldPasswordController.text;
    final newPassword = _newPassword;

    setState(() => _isLoading = true);
    try {
      final authApi = ApiServices.getAuthServices();
      final result = await authApi.changePassword(widget.jsonWT!, oldPassword, newPassword);

      if (!result) {
        debugPrint('Change failed, check the jwt.');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Change failed, check your information.'),
              backgroundColor: Colors.white,
            ),
          );
          setState(() => _isLoading = false);
          return;
        }
      }
      
      if (mounted) {
        // Navigate back (to Account)
        Navigator.pop(context);
      }
    } on ApiError catch (error) {
      debugPrint(error.toString());
      setState(() => _isLoading = false);
    }
  }
  
  // Handled by the "Reset Password" button called by Forgot/Enforced change
  Future<void> _handleResetSubmit() async {
    // For enforced or forgot (after email locked)
    if (!_isPinComplete || !_arePasswordFieldsValid) return;
    
    setState(() => _isLoading = true);
    try {
      final email = _email;
      final pin = _pinController.text;
      final password = _newPassword;

      final authApi = ApiServices.getAuthServices();
      final result = await authApi.resetPassword(email, pin, password);

      if (!result) {
        debugPrint('Reset failed, check your information.');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Reset failed, check your information.'),
              backgroundColor: Colors.white,
            ),
          );
          setState(() => _isLoading = false);
          return;
        }
      } 
      
      if (mounted) {
        // Navigate to Login
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (context) => LoginPage()
          ),
          (route) => false, // removes all previous routes
        );
      }
    
    } on ApiError catch (error) {
      debugPrint(error.toString());
      setState(() => _isLoading = false);
    }
  }
  
  // ---------- Password field callbacks ----------
  void _onOldPasswordChanged(String value) {
    setState(() {
      _isOldPasswordValid = value.trim().isNotEmpty;
    });
  }
  
  // ---------- Build ----------
  @override
  Widget build(BuildContext context) {
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

    // Subtitle based on current mode
    String subtitle;
    if (widget.intent == ChangeIntent.manual) {
      subtitle = 'Enter your passwords, old and new.';
    } else if (widget.intent == ChangeIntent.forgot && !_isCodeRequested) {
      subtitle = 'Enter your email to request a code and change your password.';
    } else {
      // enforced, or forgot after email locked
      subtitle = 'Enter your new password and the 6-digit code we emailed you.';
    }

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            secondaryGradientText(context, 'Change Your Password'),
            const SizedBox(height: 16),
            Text(
              subtitle,
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
                  // ---------- MANUAL MODE ----------
                  if (widget.intent == ChangeIntent.manual) ...[
                    TextField(
                      controller: _oldPasswordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Old Password',
                        border: OutlineInputBorder(),
                      ),
                      onChanged: _onOldPasswordChanged,
                    ),
                    const SizedBox(height: 16),
                    PasswordField(
                      label: "Password",
                      onValueChanged: (value) => _newPassword = value,
                      onValidationChanged: (isValid) => setState(() => _isNewPasswordValid = isValid),
                    ),
                    const SizedBox(height: 16),
                    ConfirmPasswordField(
                      label: "Confirm Password",
                      password: _newPassword,
                      onValidationChanged: (isValid) => setState(() => _isConfirmValid = isValid),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: AppButtonStyles.primaryElevated,
                      onPressed: _isLoading ? null : (_areManualFieldsValid ? _handleManualSubmit : null),
                      child: _isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Change Password'),
                    ),
                  ],

                  // ---------- FORGOT MODE (with debounced validation) ----------
                  if (widget.intent == ChangeIntent.forgot && !_isCodeRequested) ...[
                    DebouncedValidationField(
                      label: 'Email',
                      validator: emailValidator,
                      availabilityChecker: checkEmailExists,
                      onValueChanged: (value) => _email = value,
                      onValidationChanged: (isValid) {
                        setState(() {
                          _isEmailValidForReset = isValid;
                        });
                      },
                      startingStatus: StatusMessage(
                        message: 'Enter your email',
                        severity: Severity.unknown
                      ),
                      unavailableStatus: StatusMessage(
                        message: 'This email doesn\'t exist on our servers',
                        severity: Severity.critical
                      ),
                      emptyStatus: StatusMessage(
                        message: 'Enter your email',
                        severity: Severity.minor
                      ),
                      availableStatus: StatusMessage(
                        message: 'Click "Request Code" to receive an email',
                        severity: Severity.none
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      style: AppButtonStyles.primaryElevated,
                      onPressed: _isLoading || !_isEmailValidForReset ? null : _requestCode,
                      child: _isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Request Code'),
                    ),
                  ],

                  // ---------- ENFORCED MODE, or FORGOT after email locked ----------
                  if ((widget.intent == ChangeIntent.enforced) ||
                      (widget.intent == ChangeIntent.forgot && _isCodeRequested)) ...[
                    // PIN input
                    Pinput(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      length: 6,
                      controller: _pinController,
                      onCompleted: (value) {
                        setState(() => _isPinComplete = true);
                      },
                      onChanged: (value) {
                        setState(() {
                          _isPinComplete = value.length == 6;
                        });
                      },
                      defaultPinTheme: defaultPinTheme,
                      focusedPinTheme: defaultPinTheme.copyWith(
                        decoration: defaultPinTheme.decoration!.copyWith(
                          border: Border.all(color: goodboyGreen, width: 2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Only NEW and CONFIRM password fields (no old password)
                    PasswordField(
                      label: "Password",
                      onValueChanged: (value) => _newPassword = value,
                      onValidationChanged: (isValid) => setState(() => _isNewPasswordValid = isValid),
                    ),
                    const SizedBox(height: 16),
                    ConfirmPasswordField(
                      label: "Confirm Password",
                      password: _newPassword,
                      onValidationChanged: (isValid) => setState(() => _isConfirmValid = isValid),
                    ),
                    const SizedBox(height: 24),

                    // Submit button – enabled when pin is full AND both password fields valid
                    ElevatedButton(
                      style: AppButtonStyles.primaryElevated,
                      onPressed: _isLoading
                          ? null
                          : (_isPinComplete && _isNewPasswordValid && _isConfirmValid
                              ? _handleResetSubmit
                              : null),
                      child: _isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Reset Password'),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}