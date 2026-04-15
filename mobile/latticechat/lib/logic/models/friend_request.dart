class FriendRequestModel {
  final String id;
  final String fromId;
  final String toId;

  FriendRequestModel._({
    required this.id,
    required this.fromId,
    required this.toId
  });

  static FriendRequestModel fromJson(Map<String, dynamic> json) {
    return FriendRequestModel._(
        id: json['_id'],
        fromId: json['fromId'],
        toId: json['toId']
    );
  }
}