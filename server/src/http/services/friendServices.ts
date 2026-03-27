import { Service, UserRequest } from "../types";
import { FriendRequest, User } from "../../db";
import { addFriend, hasFriend } from "../../util/mongoose/user";
import { getFriendRequestFromTo } from "../../util/mongoose/friendrequest";

const handleAddFriendRequest: Service = async (req: UserRequest, res) => {

  const sessionBody = req.userSessionInfo;
  const senderId = sessionBody.user.id;
  const targetId = req.params.target_id ?? "";

  const sender = await User.findById(senderId);
  const target = await User.findById(targetId);

  if(sender == null || target == null) {
    res.status(404).send({success: false, message: "Sender or target not found"});
    return;
  }

  if(hasFriend(sender, target._id)) {
    res.status(409).send({success: false, message: "Already friends with this user"});
    return;
  }

  // check if target has friend request to sender
  const targetFriendRequest = await getFriendRequestFromTo(target, sender._id);

  if(targetFriendRequest != null) { // add friend to both users' friend list
    await targetFriendRequest.deleteOne();
    addFriend(sender, target._id);
    addFriend(target, sender._id);

    res.status(200).send({success: true, message: "Friend successfully added"})

  } else { // create friend request
    const newFriendRequest = new FriendRequest({
      from: sender.id,
      to: target.id,
    });
    await newFriendRequest.save();

    res.status(200).send({success: true, message: "Friend request successfully sent"})
  }
}

const handleRemoveFriendRequest: Service = async (req: UserRequest, res) => {

}

const handleRemoveFriend: Service = async (req: UserRequest, res) => {

}


export { handleAddFriendRequest, handleRemoveFriendRequest, handleRemoveFriend };