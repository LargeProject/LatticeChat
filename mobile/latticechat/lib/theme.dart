import 'package:flutter/material.dart';
import 'package:tailwind_flutter/tailwind_flutter.dart';
import 'package:animated_gradient_text/animated_gradient_text.dart';

const focusedColor = Color(0xFF34C759);   // for active toggles
final backgroundColor = TwColors.zinc.shade950; // trueblack
final darkerForeground = TwColors.zinc.shade900.withAlpha(204); // TODO: THIS IS WRONG
final foregroundColor = TwColors.zinc.shade900; // offblack
final borderColor = TwColors.zinc.shade800;
final fadedTextColor = TwColors.zinc.shade500;
const primaryColor = Color(0xFFE1E1E1);   // offwhite
const secondaryColor = Color(0xFFE2E2E2); // underwhite
const tertiaryColor = Color(0xFFA3A3A3);  // concrete
const quatenaryColor = Color(0xFF252525); // deep grey

const goodboyGreen = Color(0xFF00FF80);   // for confirmations
const badboyRed = Color(0xFFC04A42);      // for errors

const cursorColor = Colors.white;               // This is the cursor bar
const selectionColor = Color(0x3D00FF80);       // This is the text highlight
const selectionHandleColor = Color(0xDD00FF80); // These are the guitar picks

// Gradient Colors
final twCyan = TwColors.cyan.shade400;
final twPurple = TwColors.purple.shade500;
final twBlue = TwColors.blue.shade500;

final ThemeData darkTheme = ThemeData.dark().copyWith(
  // Base colors
  colorScheme: ColorScheme.dark(
    primary: primaryColor,
    secondary: tertiaryColor,
    surface: backgroundColor,
    error: badboyRed,
    onPrimary: Colors.black,
    onSecondary: Colors.black,
    onSurface: foregroundColor,
    surfaceContainerHighest: Colors.white,
  ),
  
  scaffoldBackgroundColor: backgroundColor,
  
  // AppBar theme
  appBarTheme: AppBarTheme(
    backgroundColor: foregroundColor,
    elevation: 0,
    iconTheme: IconThemeData(color: Colors.white),
    titleTextStyle: TextStyle(
      color: Colors.white,
      fontSize: 20,
      fontWeight: FontWeight.w600,
    ),
  ),
  
  // Text theme - choose the substyle depending on the situation
  textTheme: ThemeData.dark().textTheme.copyWith(
    // Your custom text styles
    bodyLarge: const TextStyle(color: primaryColor),  // for large body text
    bodyMedium: TextStyle(color: fadedTextColor),       // for medium body text
    bodySmall: const TextStyle(color: tertiaryColor), // for small body text
    // Additional text styles needed for login page
    headlineLarge: const TextStyle(
      fontSize: 36,
      fontWeight: FontWeight.bold,
      color: primaryColor,
    ),
    labelLarge: const TextStyle(
      fontSize: 16,
      fontWeight: FontWeight.normal,
      letterSpacing: 0.5,
    ),
  ),
  
  // Text selection theme (cursor, highlight, handles)
  textSelectionTheme: const TextSelectionThemeData(
    cursorColor: cursorColor,
    selectionColor: selectionColor,   // semi-transparent green
    selectionHandleColor: selectionHandleColor, // opaque green
  ),
  
  // Input decoration theme
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: backgroundColor,
    labelStyle: const TextStyle(color: tertiaryColor),
    floatingLabelStyle: const TextStyle(color: primaryColor),
    enabledBorder: OutlineInputBorder(
      borderSide: const BorderSide(color: quatenaryColor),
      borderRadius: BorderRadius.circular(0),
    ),
    focusedBorder: OutlineInputBorder(
      borderSide: const BorderSide(color: primaryColor),
      borderRadius: BorderRadius.circular(0),
    ),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(0),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
  ),
  
  // ElevatedButton theme
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      minimumSize: Size.zero,
      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(0),
        side: BorderSide(color: primaryColor, width: 1),  // outline
      ),
      backgroundColor: TwColors.zinc.shade100,
      foregroundColor: Colors.black,
      textStyle: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.bold,
      ),
    ),
  ),
  
  // TextButton theme
  textButtonTheme: TextButtonThemeData(
    style: ButtonStyle(
      textStyle: WidgetStatePropertyAll(
        const TextStyle(
          decoration: TextDecoration.underline,
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: tertiaryColor,
        ),
      ),
      foregroundColor: WidgetStatePropertyAll(tertiaryColor),
    ),
  ),
);

// Additional Button Styles
class AppButtonStyles {
  static ButtonStyle primaryElevated = ElevatedButton.styleFrom(
    minimumSize: const Size(double.infinity, 0),
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
    shape: RoundedRectangleBorder(),  // remove outline
  );

  static ButtonStyle secondaryElevated = ElevatedButton.styleFrom(
    backgroundColor: Colors.transparent,
    foregroundColor: TwColors.zinc.shade100,
    side: BorderSide(color: TwColors.zinc.shade100),
    minimumSize: const Size(double.infinity, 0),
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
  );

  static ButtonStyle dangerElevated = ElevatedButton.styleFrom(
    backgroundColor: badboyRed,
    foregroundColor: Colors.white,
    minimumSize: const Size(double.infinity, 0),
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
  );
}

// Container Styles
final class AppContainerStyles {
  static final genericBox = BoxDecoration(
    color: foregroundColor,
    border: Border.fromBorderSide(BorderSide(color: borderColor)),
    borderRadius: BorderRadius.all(Radius.circular(8)),
  );
    static final darkBox = BoxDecoration(
    color: darkerForeground,
    border: Border.fromBorderSide(BorderSide(color: borderColor)),
    borderRadius: BorderRadius.all(Radius.circular(8)),
  );
}

// Animated Gradient Text Styles
AnimatedGradientText primaryGradientText(BuildContext context, String text) {
  return AnimatedGradientText(
    text: text,
    textStyle: Theme.of(context).textTheme.headlineLarge, // fallback
    colors: [
      // Title gradient
      Colors.cyan,
      Colors.purple,
      Colors.blue,
      Colors.cyan,
    ],
  );
}
AnimatedGradientText secondaryGradientText(BuildContext context, String text) {
  return AnimatedGradientText(
    text: text,
    textStyle: TextStyle(
      color: primaryColor,
      fontSize: 30,
      fontWeight: FontWeight.w500,
    ), // fallback
    colors: [
      // Title gradient
      TwColors.green.shade400,
      TwColors.teal.shade400,
      TwColors.cyan.shade400,
      TwColors.green.shade400,
    ],
  );
}

// TODO: Create a StatusMessage type made out of a Box and Text
//  to be used in the register.dart page