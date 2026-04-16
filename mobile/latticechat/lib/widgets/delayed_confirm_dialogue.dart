import 'dart:async';
import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';

/// A dialog that requires the user to wait 3 seconds before the destructive
/// action becomes available.
class DelayedConfirmDialog extends StatefulWidget {
  final VoidCallback onConfirm;
  const DelayedConfirmDialog({super.key, required this.onConfirm});

  @override
  State<DelayedConfirmDialog> createState() => _DelayedConfirmDialogState();
}

class _DelayedConfirmDialogState extends State<DelayedConfirmDialog> {
  int _remainingSeconds = 3;
  late Timer _timer;
  bool _confirmed = false;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 1) {
        setState(() => _remainingSeconds--);
      } else {
        setState(() => _confirmed = true);
        _timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Are you sure?', textAlign: TextAlign.center,),
      content: const Text(
        'Account deletion is permanent.\n'
        'We cannot undo it for you afterwards.',
        textAlign: TextAlign.center,
      ),
      actions: [
        TextButton(
          style: AppButtonStyles.invertedElevated,
          onPressed: () => Navigator.pop(context),
          child: const Text('No, this was an accident'),
        ),
        const SizedBox(height: 8),

        TextButton(
          onPressed: _confirmed
              ? () {
                  Navigator.pop(context);
                  widget.onConfirm();
                }
              : null,
          style: AppButtonStyles.dangerElevated,
          child: Text(_confirmed ? 'Yes, delete it' : 'Wait $_remainingSeconds s'),
        ),
        const SizedBox(height: 8),
      ],
    );
  }
}