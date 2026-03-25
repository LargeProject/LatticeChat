import { UserDocument } from "../../db/schemas/User";
import { FriendRequestDocument } from "../../db/schemas/FriendRequest";
import { FriendRequest } from "../../db";
import { ObjectId } from "mongodb";

const getFriendRequestFromTo = async (user: UserDocument, targetId: ObjectId) => {
  for (const friendRequestId of user.outgoingFriendRequests) {
    const friendRequest = await FriendRequest.findById(friendRequestId);
    if(friendRequest != null && friendRequest.to._id.equals(targetId)) {
      return friendRequest;
    }
  }
  return null;
}

export { getFriendRequestFromTo };

