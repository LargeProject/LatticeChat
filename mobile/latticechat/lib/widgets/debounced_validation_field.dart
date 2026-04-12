import 'package:flutter/material.dart';
import 'package:flutter_debouncer/flutter_debouncer.dart';
import 'package:latticechat/theme.dart';
import 'package:latticechat/utils/severity.dart';
import 'package:latticechat/utils/validators.dart';

class DebouncedValidationField extends StatefulWidget {
  final String label;
  final ValueValidator validator;
  final Future<bool> Function(String)? availabilityChecker;
  final Duration debounceDelay;

  // Customizable status messages
  final StatusMessage startingStatus;
  final StatusMessage emptyStatus;
  final StatusMessage validatingStatus;
  final StatusMessage requestingStatus;
  final StatusMessage noContactStatus;
  final StatusMessage availableStatus;
  final StatusMessage unavailableStatus;

  // Callbacks for when the field has stabilized (debounced)
  final ValueChanged<String>? onValueChanged;
  final ValueChanged<bool>? onValidationChanged;  // true = valid

  const DebouncedValidationField({
    super.key,
    required this.label,
    required this.validator,
    required this.availabilityChecker,
    this.debounceDelay = const Duration(milliseconds: 500),
    this.startingStatus = const StatusMessage(
      message: '',
      severity: Severity.unknown
    ),
    this.emptyStatus = const StatusMessage(
      message: 'Field required',
      severity: Severity.major
    ),
    this.validatingStatus = const StatusMessage(
      message: 'Checking validity...',
      severity: Severity.unknown
    ),
    this.requestingStatus = const StatusMessage(
      message: 'Requesting availability...',
      severity: Severity.unknown
    ),
    this.noContactStatus = const StatusMessage(
      message: 'Unable to contact server',
      severity: Severity.critical
    ),
    this.availableStatus = const StatusMessage(
      message: 'Available',
      severity: Severity.none
    ),
    this.unavailableStatus = const StatusMessage(
      message: 'Unavailable',
      severity: Severity.critical
    ),
    this.onValueChanged,
    this.onValidationChanged,
  });

  @override
  State<DebouncedValidationField> createState() => _DebouncedValidationFieldState();
}

class _DebouncedValidationFieldState extends State<DebouncedValidationField> {
  final TextEditingController _controller = TextEditingController();
  final Debouncer _debouncer = Debouncer();
  // Default upon opening the page or initializing the widget.
  StatusMessage _status = StatusMessage(message: '', severity: Severity.unknown);

  void _notifyParent(String value, bool isValid) {
    widget.onValueChanged?.call(value);
    widget.onValidationChanged?.call(isValid);
  }

  void _onTextChanged(String value) {
    _debouncer.debounce(
      duration: widget.debounceDelay,
      onDebounce: () async {
        // Begin checking
        setState(() => _status = widget.validatingStatus);

        if (value.isEmpty) {
          setState(() => _status = widget.emptyStatus);
          return;
        }

        final validatorMessage = widget.validator(value);
        if (validatorMessage != null) {
          setState(() => _status = validatorMessage);
          return;
        }

        setState(() => _status = widget.requestingStatus);
        if (widget.availabilityChecker == null) {
          setState(() => _status = widget.noContactStatus);
          widget.onValueChanged?.call(value);
          return;
        }

        final bool available = await widget.availabilityChecker!(value);
        setState(() {
          _status = available ? widget.availableStatus : widget.unavailableStatus;
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
        
        _status,
      ],
    );
  }
}