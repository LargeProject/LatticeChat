import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'package:latticechat/utils/severity.dart';
import 'package:zxcvbn/zxcvbn.dart';

class PasswordField extends StatefulWidget {
  final String label;
  final bool obscureText;

  // Callback for when the field has changed
  final ValueChanged<String>? onValueChanged;
  final ValueChanged<bool>? onValidationChanged;  // true = strong password

  const PasswordField({
    super.key,
    this.label = 'Password',
    this.obscureText = true,
    this.onValueChanged,
    this.onValidationChanged,
  });

  @override
  State<PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<PasswordField> {
  final TextEditingController _controller = TextEditingController();
  final zxcvbnEvaluator = Zxcvbn();
  StatusMessage _status = const StatusMessage(message: 'Password strength:', severity: Severity.unknown);

  void _notifyParent(String value, bool isValid) {
    widget.onValueChanged?.call(value);
    widget.onValidationChanged?.call(isValid);
  }

  void _onTextChanged(String value) {
    setState(() {
      if (value.isEmpty) {
        _status = const StatusMessage(
          message: 'Password strength: Literally the weakest',
          severity: Severity.critical
        );
        widget.onValueChanged?.call(value);
        widget.onValidationChanged?.call(false);
        return;
      }
      // Only changed to true when score >= 3
      bool isStrongEnough = false;

      // Evaluate the strength of the password
      final result = zxcvbnEvaluator.evaluate(value);

      // Set the status message
      switch (result.score) {
        case 4:
          _status = const StatusMessage(
            message: 'Password strength: Strong',
            severity: Severity.none
          );
          break;
        case 3:
          _status = const StatusMessage(
            message: 'Password strength: Okay',
            severity: Severity.minor
          );
          break;
        case 2:
          _status = const StatusMessage(
            message: 'Password strength: Weak',
            severity: Severity.major
          );
          break;
        case 1:
          _status = const StatusMessage(
            message: 'Password strength: Very weak',
            severity: Severity.major
          );
          break;
        default:
          _status = const StatusMessage(
            message: 'Password strength: Extremely weak',
            severity: Severity.critical
          );
      }

      isStrongEnough = (result.score! >= 3);

      // Called after changing, allowing for response before server sees it
      _notifyParent(value, isStrongEnough);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _controller,
          obscureText: widget.obscureText,
          decoration: InputDecoration(
            labelText: widget.label,
            border: const OutlineInputBorder(),
          ),
          onChanged: _onTextChanged,
        ),

        const SizedBox(height: 8),

        _status,
      ],
    );
  }
}