import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:latticechat/logic/models/ws/create_message.dart';
import 'package:latticechat/logic/models/ws/hand_shake.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter/cupertino.dart';

import '../models/message.dart';

enum Status {
  disconnected,
  connecting,
  connected,
  error,
}

class SocketService extends ChangeNotifier {

  final String socketUrl = dotenv.env['WS_URL']!;

  io.Socket? socket;

  Status _status = Status.disconnected;
  Status get status => _status;

  void _setStatus(Status status) {
    _status = status;
    notifyListeners();
  }

  void connect() async {
    if(_status == Status.connected || _status == Status.connecting) return;
    if(socket != null) socket!.close();

    socket = io.io(socketUrl, io.OptionBuilder().setTransports(['websocket']).build());

    socket!.connect();
    _status = Status.connecting;

    socket!.onConnect((_) {
      debugPrint('Socket connected! ${socket!.id}');
      _setStatus(Status.connected);
    });

    socket!.onDisconnect((_) {
      debugPrint("Socket disconnected!");
      _setStatus(Status.disconnected);
    });

    socket!.onError((res) {
      debugPrint('Error occurred while attempting to connect to socket: $res');
      _setStatus(Status.error);
    });
  }

  Future<dynamic> emitHandShake(InitHandShake initHandShake) async {
    return socket?.emitWithAckAsync('initHandshake', initHandShake.toJson());
  }

  Future<dynamic> emitMessage(CreateMessageModel message) async {
    return socket?.emitWithAckAsync('createMessage', message.toJson());
  }

  void onMessage(Function(MessageModel) callback) {
    socket?.off('newMessage');
    socket?.on('newMessage', (res) {
      MessageModel message = MessageModel.fromJson(res);
      callback(message);
    });
  }


}