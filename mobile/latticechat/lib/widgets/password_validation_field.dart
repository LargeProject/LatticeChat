import 'package:flutter/material.dart';
import 'package:latticechat/utils/validators.dart';
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
  PasswordFieldState createState() => PasswordFieldState();
}

class PasswordFieldState extends State<PasswordField> {
  final TextEditingController _controller = TextEditingController();
  String _statusMessage = '';

  void _notifyParent(String value, bool isValid) {
    widget.onValueChanged?.call(value);
    widget.onValidationChanged?.call(isValid);
  }

  void _onTextChanged(String value) {
    setState(() {
      if (value.isEmpty) {
        _statusMessage = '';
        widget.onValueChanged?.call(value);
        widget.onValidationChanged?.call(false);
        return;
      }

      final strength = evaluatePasswordStrength(value);
      final isStrong = (strength == PasswordStrength.strong);

      switch (strength) {
        case PasswordStrength.weak:
          _statusMessage = 'Weak – use 8+ chars, upper/lower, number, special';
          break;
        case PasswordStrength.medium:
          _statusMessage = 'Medium – add special chars or numbers';
          break;
        case PasswordStrength.strong:
          _statusMessage = '✓ Strong password';
          break;
      }

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
            color: _statusMessage.contains('✓')
                ? Colors.green
                : (_statusMessage.contains('Weak') ? Colors.red : Colors.orange),
          ),
        ),
      ],
    );
  }
}