import 'dart:js_interop';

import 'package:latticechat/logic/models/user.dart';

class ConversationModel {

  final String id;
  final String name;
  final bool isDirectMessage;
  final String ownerId;
  final List<BasicUserModel> members;

  ConversationModel._({
    required this.id,
    required this.name,
    required this.isDirectMessage,
    required this.ownerId,
    required this.members
  });

  static ConversationModel fromJson(Map<String, dynamic> json) {
    JSArray jsMembers = json['members'];
    final members = jsMembers.toDart.map((jsonFriend) => BasicUserModel.fromJson(jsonFriend as Map<String, dynamic>)).toList();

    return ConversationModel._(
      id: json['id'],
      name: json['name'],
      isDirectMessage: json['isDirectMessage'],
      ownerId: json['ownerId'],
      members: members
    );
  }

}