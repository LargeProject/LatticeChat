import { Conversation, FriendRequest, KeyExchangeRequest, Message, User, Account } from '../db/models';
import type actions from '@latticechat/shared';
import { HttpError, HttpErrors } from '../util/error';
import type { BasicUserInfo } from '../http/types';
import type { CreateConversation } from '@latticechat/shared';
import type { UserDocument } from '../db/schemas/User';

export async function getConversation(conversationId: string) {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw HttpErrors.CONVERSATION_NOT_FOUND;
  }

  return conversation;
}

// Note: data may include isDirectMessage but callers must use the options.trustedSource flag
export async function createConversation(
  data: actions.CreateConversation & { isDirectMessage?: boolean },
  options?: { trustedSource?: boolean },
) {
  const { ownerId, memberIds, isDirectMessage } = data as any;
  const trusted = options?.trustedSource ?? false;

  if (isDirectMessage && !trusted) {
    // Prevent untrusted callers (e.g. websocket clients) from creating DMs
    throw new HttpError('Direct message creation forbidden', 403);
  }

  const owner = ownerId ? await User.findById(ownerId) : null;

  const members = await User.find({ _id: { $in: memberIds } });
  const name = (data as any).name ?? createConversationName(members.map((m: any) => m.name));

  const conversation = await Conversation.create({
    ...(owner != null && { owner: owner._id }),
    name,
    memberIds: members.map((m: any) => m._id),
    ...(isDirectMessage ? { isDirectMessage: true } : {}),
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
  const messages = await Message.find({ conversationId });

  return messages;
}

export async function createMessage(data: actions.CreateMessage) {
  const { senderId, conversationId, content } = data;
  const sender = await User.findById(senderId);
  if (!sender) {
    console.error(`createMessage: sender ${senderId} not found`);
    throw new Error('User not found');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    console.error(`createMessage: conversation ${conversationId} not found`);
    throw new Error('Conversation not found');
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
        throw HttpErrors.TARGET_NOT_FOUND;
      case 'user':
        throw HttpErrors.USER_NOT_FOUND;
    }
  }

  return user;
}

export async function createFriendRequest(senderId: string, targetId: string) {
  const sender = await findUser(senderId, 'user');
  const target = await findUser(targetId, 'target');

  if (sender._id.equals(target._id)) {
    throw HttpErrors.SELF_FRIEND_REQUEST;
  }

  if (sender.hasFriend(target._id)) {
    throw HttpErrors.FRIEND_EXISTS;
  }

  const friendRequest = await FriendRequest.findOne({ fromId: sender._id, toId: target._id });
  if (friendRequest != null) {
    throw HttpErrors.FRIEND_REQUEST_EXISTS;
  }

  const targetFriendRequest = await target.getFriendRequestTo(sender._id);

  // check if target has pending request
  if (targetFriendRequest != null) {
    await targetFriendRequest.deleteOne();
    sender.addFriend(target._id);
    target.addFriend(sender._id);

    const createConversationData: CreateConversation = { memberIds: [senderId, targetId] } as any;
    // internal trusted creation for direct messages
    await createConversation(createConversationData, { trustedSource: true });

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

  const friendRequest = await FriendRequest.findOne({ fromId: sender._id, toId: target._id });
  if (friendRequest == null) {
    throw HttpErrors.FRIEND_REQUEST_NOT_FOUND;
  }

  await friendRequest.deleteOne();
}

export async function getFriendRequests(userId: string) {
  const friendRequests = await FriendRequest.find({
    $or: [{ fromId: userId }, { toId: userId }],
  });

  return friendRequests;
}

export async function removeFriend(sourceId: string, targetId: string) {
  const source = await findUser(sourceId, 'user');
  const target = await findUser(targetId, 'target');

  if (!source.hasFriend(target._id)) {
    throw HttpErrors.FRIEND_NOT_FOUND;
  }

  source.removeFriend(target._id);
  target.removeFriend(source._id);
}

export async function isEmailVerified(email: string) {
  const user = await User.findOne({ email: email });
  if (user == null) {
    throw HttpErrors.EMAIL_NOT_FOUND;
  }

  return user.emailVerified;
}

export async function isEmailTaken(email: string) {
  const user = await User.findOne({ email: email });
  return user != null;
}

export async function isUsernameTaken(username: string) {
  const user = await User.findOne({ name: username });
  return user != null;
}

export async function deleteUser(userId: string) {
  const user = await findUser(userId);
  await user.deleteOne();
}

export async function getBasicUserInfoByName(name: string) {
  const user = await User.findOne({ name: name });
  return await getBasicUserInfo(user);
}

export async function getBasicUserInfoById(userId: string) {
  const user = await User.findById(userId);
  return await getBasicUserInfo(user);
}

async function getBasicUserInfo(user: UserDocument | null): Promise<BasicUserInfo> {
  if (user == null) {
    throw HttpErrors.USER_NOT_FOUND;
  }

  return {
    id: user._id.toString(),
    name: user.name,
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
    throw HttpErrors.KEY_EXCHANGE_REQUEST_EXISTS;
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

  return keyExchangeRequests;
}

export async function deleteKeyExchangeRequestsTo(userId: string) {
  const user = await findUser(userId);

  await KeyExchangeRequest.deleteMany({ toId: user.id });
}
