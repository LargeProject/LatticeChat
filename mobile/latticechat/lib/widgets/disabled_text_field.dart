import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';

class DisabledTextField extends StatelessWidget {
  final String label;
  final String value;
  final Color? textColor;
  final Color? borderColor;
  final double? fontSize;

  const DisabledTextField({
    super.key,
    required this.label,
    required this.value,
    this.textColor,
    this.borderColor,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: TextEditingController(text: value),
      enabled: false,
      textAlign: TextAlign.center,
      style: TextStyle(color: textColor ?? tertiaryColor),
      decoration: InputDecoration(
        labelText: label,
        floatingLabelAlignment: FloatingLabelAlignment.center,
        floatingLabelStyle: Theme.of(context)
            .inputDecorationTheme
            .floatingLabelStyle
            ?.copyWith(fontSize: fontSize ?? 18),
        disabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: borderColor ?? quatenaryColor),
        ),
      ),
    );
  }
}