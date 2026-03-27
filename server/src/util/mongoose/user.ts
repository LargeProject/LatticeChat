import { UserDocument } from "../../db/schemas/User";
import { ObjectId } from "mongodb";

const addFriend = (user: UserDocument, friendId: ObjectId)=> {
  user.friends.push(friendId);
  user.save();
}

const hasFriend = (user: UserDocument, friendId: ObjectId) => {
  return user.friends.some(friendId => friendId.equals(friendId));
}

export { addFriend, hasFriend }