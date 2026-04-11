import 'package:flutter/material.dart';
import 'package:flutter_debouncer/flutter_debouncer.dart';

typedef ValueValidator = bool Function(String value);

class DebouncedValidationField extends StatefulWidget {
  final String label;
  final ValueValidator validator;
  final Future<bool> Function(String)? availabilityChecker;
  final Duration debounceDelay;

  // Customizable status messages

  final String emptyMessage;
  final String checkingMessage;
  final String invalidFormatMessage;
  final String noContactMessage;
  final String availableMessage;
  final String unavailableMessage;

  // Callbacks for when the field has stabilized (debounced)
  final ValueChanged<String>? onValueChanged;
  final ValueChanged<bool>? onValidationChanged;  // true = valid

  const DebouncedValidationField({
    super.key,
    required this.label,
    required this.validator,
    this.availabilityChecker,
    this.debounceDelay = const Duration(milliseconds: 500),
    this.emptyMessage = 'Enter to check availability.',
    this.checkingMessage = 'Checking availability...',
    this.invalidFormatMessage = 'Invalid format',
    this.noContactMessage = 'Unable to contact server',
    this.availableMessage = 'Available',
    this.unavailableMessage = 'Unavailable',
    this.onValueChanged,
    this.onValidationChanged,
  });

  @override
  State<DebouncedValidationField> createState() => _DebouncedValidationFieldState();
}

class _DebouncedValidationFieldState extends State<DebouncedValidationField> {
  final TextEditingController _controller = TextEditingController();
  final Debouncer _debouncer = Debouncer();
  String _statusMessage = '';

  void _notifyParent(String value, bool isValid) {
    widget.onValueChanged?.call(value);
    widget.onValidationChanged?.call(isValid);
  }

  void _onTextChanged(String value) {
    _debouncer.debounce(
      duration: widget.debounceDelay,
      onDebounce: () async {
        setState(() => _statusMessage = widget.checkingMessage);

        if (!widget.validator(value)) {
          setState(() => _statusMessage = widget.invalidFormatMessage);
          return;
        }

        if (widget.availabilityChecker == null) {
          setState(() => _statusMessage = widget.noContactMessage);
          widget.onValueChanged?.call(value);
          return;
        }

        final bool available = await widget.availabilityChecker!(value);
        setState(() {
          _statusMessage = available ? widget.availableMessage : widget.unavailableMessage;
        });

        // Called after debouncing, allowing for response before server sees it
        _notifyParent(value, available);
      },
    );
  }

  @override
  void dispose() {
    _debouncer.cancel();
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
            color: _statusMessage.contains('Available')
                ? Colors.green
                : (_statusMessage.contains('Unavailable') ? Colors.red : Colors.orange),
          ),
        ),
      ],
    );
  }
}