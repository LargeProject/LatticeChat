import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:latticechat/logic/services/auth.dart';
import 'package:latticechat/logic/services/conversation.dart';
import 'package:latticechat/logic/services/user.dart';

class ApiServices {
  static final String _baseUrl = dotenv.env['API_BASE_URL']!;
  static final _authServices = AuthServices(_baseUrl);
  static final _userServices = UserServices(_baseUrl);
  static final _conversationServices = ConversationServices(_baseUrl);

  static AuthServices getAuthServices() {
    return _authServices;
  }

  static UserServices getUserServices() {
    return _userServices;
  }

  static ConversationServices getConversationServices() {
    return _conversationServices;
  }
}