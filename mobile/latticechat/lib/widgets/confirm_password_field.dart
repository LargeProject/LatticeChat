import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'package:latticechat/utils/severity.dart';

class ConfirmPasswordField extends StatefulWidget {
  final String label;
  final String password; // to confirm with
  final ValueChanged<String>? onValueChanged;
  final ValueChanged<bool>? onValidationChanged;

  const ConfirmPasswordField({
    super.key,
    this.label = 'Confirm Password',
    required this.password,
    this.onValueChanged,
    this.onValidationChanged,
  });

  @override
  State<ConfirmPasswordField> createState() => _ConfirmPasswordFieldState();
}

class _ConfirmPasswordFieldState extends State<ConfirmPasswordField> {
  final TextEditingController _controller = TextEditingController();
  StatusMessage _status = const StatusMessage(message: 'Confirm your password', severity: Severity.unknown);

  void _notifyParent(String value, bool isValid) {
    widget.onValueChanged?.call(value);
    widget.onValidationChanged?.call(isValid);
  }

  void _validateAndNotify(String value) {
    setState(() {
      if (value.isEmpty) {
        _status = const StatusMessage(
          message: 'Confirm your password',
          severity: Severity.unknown
        );
        _notifyParent(value, false);
        return;
      }
      
      final bool matches = (value == widget.password);
      _status = matches ?
        const StatusMessage(
          message: 'Passwords match',
          severity: Severity.none
        )
        : const StatusMessage(
          message: 'Passwords do not match, yet',
          severity: Severity.minor
        );

      // Called after changing, allowing for response before server sees it
      _notifyParent(value, matches);
    });
  }

  void _onTextChanged(String value) {
    _validateAndNotify(value);
  }

  @override
  void didUpdateWidget(covariant ConfirmPasswordField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.password != widget.password) {
      // Defer the re‑validation to avoid calling setState during build
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _validateAndNotify(_controller.text);
        }
      });
    }
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
          obscureText: true,
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