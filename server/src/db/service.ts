import { Conversation, FriendRequest, KeyExchangeRequest, Message, User } from './models';
import actions, { CreateConversation } from '@latticechat/shared';
import { ErrorCodes, HttpError } from '../util/error';
import { BasicUserInfo } from '../http/types';
import { UserDocument } from './schemas/User';

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
  const name = data.name ?? createConversationName(members.map((m) => m.displayUsername ?? m.username));

  const conversation = await Conversation.create({
    ...(owner != null && { owner: owner._id }),
    name,
    memberIds: members.map((m) => m._id),
  });

  return conversation;
}

export async function removePrivateConversation(data: actions.RemovePrivateConversation) {
  const { memberIds } = data;
  const [memberId1, memberId2] = memberIds;

  const conversation = await Conversation.findOne({
    memberIds: {
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
  const messages = await Message.find({ conversationId: conversationId });
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
    senderId: sender._id,
    conversationId: conversation._id,
    content,
  });

  return message;
}

export async function findUser(userId: string, type: 'user' | 'target' = 'user') {
  const user = await User.findById(userId);
  if (user == null) {
    switch (type) {
      case 'target':
        throw new HttpError(404, ErrorCodes.TARGET_NOT_FOUND, 'Target not found');
      case 'user':
        throw new HttpError(404, ErrorCodes.USER_NOT_FOUND, 'User not found');
    }
  }

  return user;
}

export async function createFriendRequest(senderId: string, targetId: string) {
  const sender = await findUser(senderId, 'user');
  const target = await findUser(targetId, 'target');

  if (sender._id.equals(target._id)) {
    throw new HttpError(409, ErrorCodes.SELF_FRIEND_REQUEST, "Friend requests to one's own account are not allowed");
  }

  if (sender.hasFriend(target._id)) {
    throw new HttpError(409, ErrorCodes.FRIEND_EXISTS, 'Already friends with this user');
  }

  const friendRequest = await FriendRequest.findOne({
    fromId: sender._id,
    toId: target._id,
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

    // create conversation
    const createConversationData: CreateConversation = {
      memberIds: [senderId, targetId],
    };
    await createConversation(createConversationData);

    return null;
  } else {
    return await FriendRequest.create({
      fromId: sender.id,
      toId: target.id,
    });
  }
}

export async function removeFriendRequest(fromId: string, toId: string) {
  const sender = await findUser(fromId, 'user');
  const target = await findUser(toId, 'target');

  const friendRequest = await FriendRequest.findOne({
    fromId: sender._id,
    toId: target._id,
  });

  if (friendRequest == null) {
    throw new HttpError(404, ErrorCodes.FRIEND_REQUEST_NOT_FOUND, 'Friend request not found');
  }

  await friendRequest.deleteOne();
}

export async function getFriendRequests(userId: string) {
  const friendRequests = await FriendRequest.find({
    $or: [{ fromId: userId }, { toId: userId }],
  });

  if (!friendRequests) {
    return [];
  }

  return friendRequests;
}

export async function removeFriend(sourceId: string, targetId: string) {
  const source = await findUser(sourceId, 'user');
  const target = await findUser(targetId, 'target');

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

export async function createKeyExchangeRequest(fromId: string, toId: string, cipher: string) {
  const sender = await findUser(fromId, 'user');
  const target = await findUser(toId, 'target');

  const keyExchangeRequest = await KeyExchangeRequest.findOne({
    $or: [
      { fromId: sender.id, toId: target.id },
      { fromId: target.id, toId: sender.id },
    ],
  });

  if (keyExchangeRequest != null) {
    throw new HttpError(404, ErrorCodes.KEY_EXCHANGE_REQUEST_EXISTS, 'Key exchange request exists');
  }

  await KeyExchangeRequest.create({
    fromId: sender.id,
    toId: target.id,
    cipher: cipher,
  });
}

export async function findKeyExchangeRequestsTo(userId: string) {
  const user = await findUser(userId);

  const keyExchangeRequests = await KeyExchangeRequest.find({
    toId: user._id,
  });

  if (!keyExchangeRequests) {
    return [];
  }

  return keyExchangeRequests;
}

export async function deleteKeyExchangeRequestsTo(userId: string) {
  const user = await findUser(userId);

  await KeyExchangeRequest.deleteMany({
    toId: user.id,
  });
}
