import type * as actions from '@latticechat/shared';
import { Conversation, Message, User } from '../models';

export const MessageServiceErrors = {
  USER_NOT_FOUND: 'User not found',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
};

export class MessageService {
  static async createMessage(data: actions.CreateMessage) {
    const { senderId, conversationId, content } = data;
    const sender = await User.findById(senderId);
    if (!sender) {
      console.error(`createMessage: sender ${senderId} not found`);
      throw new Error(MessageServiceErrors.USER_NOT_FOUND);
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.error(`createMessage: conversation ${conversationId} not found`);
      throw new Error(MessageServiceErrors.CONVERSATION_NOT_FOUND);
    }

    const message = await Message.create({
      senderId: sender._id,
      conversationId: conversation._id,
      content,
    });

    return message;
  }
}
