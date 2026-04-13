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
    List<Map<String, dynamic>> jsonMembers = json['members'].cast<Map<String, dynamic>>();
    final members = jsonMembers.map((jsonMember) => BasicUserModel.fromJson(jsonMember)).toList();

    return ConversationModel._(
      id: json['id'],
      name: json['name'],
      isDirectMessage: json['isDirectMessage'],
      ownerId: json['ownerId'],
      members: members
    );
  }

}