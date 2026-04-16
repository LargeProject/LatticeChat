import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:latticechat/logic/services/auth.dart';
import 'package:latticechat/logic/services/conversation.dart';
import 'package:latticechat/logic/services/socket.dart';
import 'package:latticechat/logic/services/user.dart';

class ApiServices {
  static final String _baseUrl = dotenv.env['API_BASE_URL']!;
  static final AuthServices _authServices = AuthServices(_baseUrl);
  static final UserServices _userServices = UserServices(_baseUrl);
  static final ConversationServices _conversationServices =
  ConversationServices(_baseUrl);
  static SocketService? _socketService;

  static AuthServices getAuthServices() {
    return _authServices;
  }

  static UserServices getUserServices() {
    return _userServices;
  }

  static ConversationServices getConversationServices() {
    return _conversationServices;
  }

  static SocketService getSocketService() {
    _socketService ??= SocketService();
    return _socketService!;
  }
}