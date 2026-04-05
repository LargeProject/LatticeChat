import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
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
  String _statusMessage = 'Password strength:';

  void _notifyParent(String value, bool isValid) {
    widget.onValueChanged?.call(value);
    widget.onValidationChanged?.call(isValid);
  }

  void _onTextChanged(String value) {
    setState(() {
      if (value.isEmpty) {
        _statusMessage = 'Password strength:';
        widget.onValueChanged?.call(value);
        widget.onValidationChanged?.call(false);
        return;
      }
      // Only changed to true when score >= 3
      bool isStrong = false;

      // Evaluate the strength of the password
      final result = zxcvbnEvaluator.evaluate(value);

      // Set the status message
      switch (result.score) {
        case 4:
          _statusMessage = 'Password strength: Strong';
          break;
        case 3:
          _statusMessage = 'Password strength: Okay';
          break;
        case 2:
          _statusMessage = 'Password strength: Weak';
          break;
        case 1:
          _statusMessage = 'Password strength: Very weak';
          break;
        default:
          _statusMessage = 'Password strength: Extremely weak';
      }

      isStrong = (result.score! >= 3);

      // Called after changing, allowing for response before server sees it
      _notifyParent(value, isStrong);
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

        const SizedBox(height: 4),

        Text(
          _statusMessage,
          style: TextStyle(
            fontSize: 12,
            color: _statusMessage.contains('trong')
                  ? Colors.green
                : (_statusMessage.contains('eak')
                  ? Colors.red
                :_statusMessage.contains('kay')
                  ?Colors.orange
                : tertiaryColor),
          ),
        ),
      ],
    );
  }
}