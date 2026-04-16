import 'package:flutter/cupertino.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:latticechat/logic/models/ws/create_message.dart';
import 'package:latticechat/logic/models/ws/hand_shake.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../models/message.dart';

enum Status {
  disconnected,
  connecting,
  connected,
  error,
}

class SocketService extends ChangeNotifier {
  io.Socket? socket;

  Status _status = Status.disconnected;
  Status get status => _status;

  String? get socketUrl {
    final explicit = dotenv.env['WS_URL'];
    if (explicit != null && explicit.trim().isNotEmpty) {
      final uri = Uri.tryParse(explicit.trim());
      if (uri == null) return explicit.trim();

      if (uri.hasScheme && uri.host.isNotEmpty) {
        final scheme = uri.scheme == 'https' ? 'wss' : uri.scheme == 'http' ? 'ws' : uri.scheme;
        return Uri(
          scheme: scheme,
          host: uri.host,
          port: uri.hasPort ? uri.port : null,
        ).toString();
      }

      return explicit.trim();
    }

    final baseUrl = dotenv.env['API_BASE_URL'];
    if (baseUrl == null || baseUrl.trim().isEmpty) {
      return null;
    }

    final uri = Uri.tryParse(baseUrl.trim());
    if (uri == null || !uri.hasScheme || uri.host.isEmpty) {
      return null;
    }

    final scheme = uri.scheme == 'https' ? 'wss' : 'ws';
    return Uri(
      scheme: scheme,
      host: uri.host,
      port: uri.hasPort ? uri.port : null,
    ).toString();
  }

  void _setStatus(Status status) {
    _status = status;
    notifyListeners();
  }

  void connect() {
    final url = socketUrl;
    if (url == null || url.isEmpty) {
      _setStatus(Status.error);
      return;
    }

    if (_status == Status.connected || _status == Status.connecting) {
      return;
    }

    if (socket != null) {
      socket!.dispose();
      socket = null;
    }

    socket = io.io(
      url,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setPath('/socket.io')
          .disableAutoConnect()
          .enableForceNew()
          .enableReconnection()
          .setReconnectionAttempts(10)
          .setReconnectionDelay(1000)
          .build(),
    );

    _setStatus(Status.connecting);

    socket!.onConnect((_) {
      debugPrint('Socket connected! ${socket!.id}');
      _setStatus(Status.connected);
    });

    socket!.onDisconnect((_) {
      debugPrint('Socket disconnected!');
      _setStatus(Status.disconnected);
    });

    socket!.onConnectError((res) {
      debugPrint('Socket connect error: $res');
      _setStatus(Status.error);
    });

    socket!.onError((res) {
      debugPrint('Socket error: $res');
      _setStatus(Status.error);
    });

    socket!.connect();
  }

  Future<dynamic> emitHandShake(InitHandShake initHandShake) async {
    if (socket == null || _status != Status.connected) {
      return null;
    }

    return socket!.emitWithAckAsync('initHandshake', initHandShake.toJson());
  }

  Future<dynamic> emitMessage(CreateMessageModel message) async {
    if (socket == null || _status != Status.connected) {
      return null;
    }

    return socket!.emitWithAckAsync('createMessage', message.toJson());
  }

  void onMessage(Function(MessageModel) callback) {
    socket?.off('newMessage');
    socket?.on('newMessage', (res) {
      if (res is Map<String, dynamic>) {
        callback(MessageModel.fromJson(res));
        return;
      }

      if (res is Map) {
        callback(MessageModel.fromJson(Map<String, dynamic>.from(res)));
      }
    });
  }

  void removeMessageListener() {
    socket?.off('newMessage');
  }

  void disconnect() {
    removeMessageListener();
    socket?.disconnect();
    socket?.dispose();
    socket = null;
    _setStatus(Status.disconnected);
  }
}