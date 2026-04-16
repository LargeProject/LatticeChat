import 'package:flutter/material.dart';
import 'package:latticechat/theme.dart';
import 'package:latticechat/pages/login.dart';
import 'package:latticechat/pages/change_password.dart';
import 'package:latticechat/logic/util/error.dart';
import 'package:latticechat/logic/services/api.dart';
import 'package:latticechat/widgets/delayed_confirm_dialogue.dart';
import 'package:latticechat/widgets/disabled_text_field.dart';

class AccountPage extends StatefulWidget {
  final String jsonWT;
  const AccountPage({super.key, required this.jsonWT});

  @override
  State<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends State<AccountPage> {
  String get jsonWT => widget.jsonWT;
  String _email = '';
  String _username = '';
  bool _isLoading = true;

  // A function meant to be called automatically upon opening this page
  Future<void> _getUserInfo() async {
    final userApi = ApiServices.getUserServices();
    final response = await userApi.fetchUser(jsonWT);
    final userModel = response.user;

    // Populate the fields
    setState(() {
      _email = userModel.email;
      _username = userModel.username;
      _isLoading = false;
    });
    return;
  }

  // Called by the Back Arrow
  void _returnPreviousPage() {
    Navigator.pop(context);
  }

  void _handleChangePassword() {
    debugPrint('Change Password button was pressed');

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ChangePasswordPage.manual(jsonWT)
      ),
    );
  }

  // A function meant to be called by the Sign Out button
  void _handleSignOut() {
    // Pop the whole navigator and go to LoginPage.
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginPage()),
      (route) => false,
    );
    return;
  }

  // A function meant to be called by the Yes, Delete It confirmation
  Future<bool> _confirmDeleteUser() async {
    // Call the UserServices function deleteUser
    try {
      final userApi = ApiServices.getUserServices();
      final response = await userApi.deleteUser(jsonWT);
      
      if (!response) {
        debugPrint('The account deletion failed, somehow.');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Account deletion failed, try again later')),
          );
        }
      }

      return true; // if it fails, we return false in the catch
    } on ApiError catch (error) {
      debugPrint(error.toString());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Account deletion failed: ${error.toString()}')),
        );
      }
      return false;
    }
  }

  // A function meant to be called by the Delete Account button
  void _handleDeleteAccount() {
    // Show a pop-up asking the user to confirm the deletion with a small timer
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return DelayedConfirmDialog(
          onConfirm: () async {
            final success = await _confirmDeleteUser();
            if (success && mounted) {
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (context) => const LoginPage()),
                (route) => false,
              );
            }
          },
        );
      },
    );
    return;
  }

  @override
  void initState() {
    super.initState();
    _getUserInfo();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Account'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _returnPreviousPage,
        ),
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Animated Gradient Text title from theme.dart
            Text('Manage Your Account', style: Theme.of(context).textTheme.headlineSmall),

            const SizedBox(height: 8),

            Text(
              'In the case that you forget who you are, you can find your account information here',
              style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center,
            ),

            const SizedBox(height: 16),

            // Container using the same style as login.dart (genericBox)
            Container(
              width: 300,
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              decoration: AppContainerStyles.genericBox,
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        DisabledTextField(label: 'Username', value: _username),
                        const SizedBox(height: 16),

                        DisabledTextField(label: 'Email', value: _email),
                        const SizedBox(height: 24),

                        ElevatedButton(
                          onPressed: _handleChangePassword,
                          style: AppButtonStyles.primaryElevated,
                          child: const Text('Change password'),
                        ),
                        const SizedBox(height: 16),

                        ElevatedButton(
                          onPressed: _handleSignOut,
                          style: AppButtonStyles.invertedElevated,
                          child: const Text('Sign out'),
                        ),
                        const SizedBox(height: 32),

                        ElevatedButton(
                          onPressed: _handleDeleteAccount,
                          style: AppButtonStyles.dangerElevated,
                          child: const Text('Delete account'),
                        ),
                      ],
                    ),
            ),

            // No extra text button at the bottom (unlike login page)
          ],
        ),
      ),
    );
  }
}