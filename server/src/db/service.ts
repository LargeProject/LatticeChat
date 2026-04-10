import { Conversation, FriendRequest, KeyExchangeRequest, Message, User, Account } from './models';
import type actions from '@latticechat/shared';
import { HttpError, HttpErrors } from '../util/error';
import type { BasicUserInfo } from '../http/types';
import type { CreateConversation } from '@latticechat/shared';
import type { UserDocument } from './schemas/User';
import { ConversationService } from './services/ConversationService';

function createConversationName(memberNames: string[]) {
  return memberNames.join(', ');
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
