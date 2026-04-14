import type * as actions from '@latticechat/shared';
import { ConversationNotFoundError, UserNotFoundError } from '../../util/error';
import { Conversation, Message, User } from '../models';

export class MessageService {
  static async createMessage(data: actions.CreateMessage) {
    const { senderId, conversationId, content } = data;
    const sender = senderId == 'system' ? { _id: senderId } : await User.findById(senderId);
    if (!sender) {
      console.error(`createMessage: sender ${senderId} not found`);
      throw new UserNotFoundError();
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.error(`createMessage: conversation ${conversationId} not found`);
      throw new ConversationNotFoundError();
    }

    const message = await Message.create({
      senderId: senderId === 'system' ? 'system' : sender._id.toString(),
      conversationId: conversation._id,
      content,
    });

    return message;
  }
}
