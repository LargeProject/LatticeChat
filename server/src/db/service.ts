import {Conversation, FriendRequest, Message, User} from './models';
import actions from '@latticechat/shared';
import {ErrorCodes, HttpError} from '../util/error';
import {BasicUserInfo} from "../http/types";
import {UserDocument} from "./schemas/User";

function createConversationName(memberNames: string[]) {
  return memberNames.join(', ');
}

export async function getConversation(conversationId: string) {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new HttpError(404, ErrorCodes.CONVERSATION_NOT_FOUND, 'Conversation not found');
  }

  return conversation;
}

export async function createConversation(data: actions.CreateConversation) {
  const { ownerId, memberIds } = data;
  const owner = await User.findById(ownerId);

  const members = await User.find({ _id: { $in: memberIds } });
  const name =
    data.name ??
    createConversationName(members.map((m) => m.displayUsername ?? m.username));

  const conversation = await Conversation.create({
    ...(owner != null && { owner: owner._id }),
    name,
    members: members.map((m) => m._id),
  });

  return conversation;
}

export async function removePrivateConversation(
  data: actions.RemovePrivateConversation,
) {
  const { memberIds } = data;
  const [memberId1, memberId2] = memberIds;

  const conversation = await Conversation.findOne({
    members: {
      $all: [memberId1, memberId2],
      $size: 2,
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  await conversation.deleteOne();
}

export async function getConversationMessages(conversationId: string) {
  const messages = await Message.find({ conversation: conversationId });
  if (!messages) {
    return [];
  }

  return messages;
}

export async function createMessage(data: actions.CreateMessage) {
  const { senderId, conversationId, content } = data;
  const sender = await User.findById(senderId);
  if (!sender) {
    return new Error('User not found');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return new Error('Conversation not found');
  }

  const message = await Message.create({
    sender: sender._id,
    conversation: conversation._id,
    content,
  });

  return message;
}

export async function createFriendRequest(senderId: string, targetId: string) {
  const sender = await User.findById(senderId);
  const target = await User.findById(targetId);

  if (sender == null) {
    throw new HttpError(404, ErrorCodes.USER_NOT_FOUND, 'User not found');
  }

  if (target == null) {
    throw new HttpError(404, ErrorCodes.TARGET_NOT_FOUND, 'Target not found');
  }

  if (sender.hasFriend(target._id)) {
    throw new HttpError(409, ErrorCodes.FRIEND_EXISTS, 'Already friends with this user');
  }

  const friendRequest = await FriendRequest.findOne({
    from: sender._id,
    to: target._id,
  });
  if (friendRequest != null) {
    throw new HttpError(409, ErrorCodes.FRIEND_REQUEST_EXISTS, 'Friend request already exists');
  }

  const targetFriendRequest = await target.getFriendRequestTo(sender._id);

  // check if target has pending request
  if (targetFriendRequest != null) {
    await targetFriendRequest.deleteOne();
    sender.addFriend(target._id);
    target.addFriend(sender._id);

    return null;
  } else {
    return await FriendRequest.create({
      from: sender.id,
      to: target.id,
    });
  }
}

export async function removeFriendRequest(fromId: string, toId: string) {
  const sender = await User.findById(fromId);
  const target = await User.findById(toId);

  if (sender == null) {
    throw new HttpError(404, ErrorCodes.USER_NOT_FOUND, 'User not found');
  }

  if (target == null) {
    throw new HttpError(404, ErrorCodes.TARGET_NOT_FOUND, 'Target not found');
  }

  const friendRequest = await FriendRequest.findOne({
    from: sender._id,
    to: target._id,
  });

  if (friendRequest == null) {
    throw new HttpError(404, ErrorCodes.FRIEND_REQUEST_NOT_FOUND, 'Friend request not found');
  }

  await friendRequest.deleteOne();
}

export async function getFriendRequests(userId: string) {
  const friendRequests = await FriendRequest.find({
    $or: [{ from: userId }, { to: userId }],
  });

  if (!friendRequests) {
    return [];
  }

  return friendRequests;
}

export async function removeFriend(sourceId: string, targetId: string) {
  const source = await User.findById(sourceId);
  const target = await User.findById(targetId);

  if (source == null) {
    throw new HttpError(404, ErrorCodes.USER_NOT_FOUND, 'User not found');
  }

  if (target == null) {
    throw new HttpError(404, ErrorCodes.TARGET_NOT_FOUND, 'Target not found');
  }

  if (!source.hasFriend(target._id)) {
    throw new HttpError(404, ErrorCodes.FRIEND_NOT_FOUND, 'Friend not found');
  }

  source.removeFriend(target._id);
  target.removeFriend(source._id);
}

export async function isEmailVerified(email: string) {
  const user = await User.findOne({ email: email });
  if (user == null) {
    throw new HttpError(404, ErrorCodes.EMAIL_NOT_FOUND, 'Email not found');
  }

  return user.emailVerified;
}

export async function isEmailTaken(email: string) {
  const user = await User.findOne({ email: email });
  return user != null;
}

export async function isUsernameTaken(username: string) {
  const user = await User.findOne({ username: username });
  return user != null;
}

export async function deleteUser(userId: string) {
  const user = await User.findById(userId);
  if (user == null) {
    throw new HttpError(404, ErrorCodes.USER_NOT_FOUND, 'User not found');
  }

  await user.deleteOne();
}

export async function getBasicUserInfoByName(name: string) {
  const user = await User.findOne({ username: name });
  return await getBasicUserInfo(user);
}

export async function getBasicUserInfoById(userId: string) {
  const user = await User.findById(userId);
  return await getBasicUserInfo(user);
}

async function getBasicUserInfo(user: UserDocument | null): Promise<BasicUserInfo> {
  if (user == null) {
    throw new HttpError(404, ErrorCodes.USER_NOT_FOUND, 'User not found');
  }

  return {
    id: user._id.toString(),
    username: user.username ?? '',
    displayUsername: user.displayUsername ?? '',
    biography: user.biography ?? '',
    createdAt: user.createdAt ?? Date.now(),
  };
}
