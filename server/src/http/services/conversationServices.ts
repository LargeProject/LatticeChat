import type { Service, UserRequest } from '../types';
import { handleHttpError } from '../../util/error';
import mongoose from 'mongoose';
import { ConversationService, UserService } from '../../db';

const handleGetConversation: Service = async (req: UserRequest, res) => {
  const userId = req.params.user_id?.toString() ?? '';
  const conversationId = req.params.conversation_id?.toString() ?? '';

  try {
    const conversation = await ConversationService.findConversation(conversationId);
    if (!conversation.hasMember(userId)) {
      res.status(401).send({
        success: false,
        message: 'Not a member of the conversation',
      });
    }

    res.status(200).send({
      success: true,
      message: 'Conversation was successfully found',
      conversation: conversation.toObject(),
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleGetConversationsBySearch: Service = async (req: UserRequest, res) => {
  const userId = req.params.user_id?.toString() ?? '';
  const search = req.query?.search?.toString() ?? '';

  try {
    const user = await UserService.findUser(userId);
    const conversations = await user.getConversationsBySearch(search);

    res.status(200).send({
      success: true,
      message: 'Conversations found',
      conversations: conversations,
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleGetConversationMessages: Service = async (req: UserRequest, res) => {
  const userId = req.params.user_id?.toString() ?? '';
  const conversationId = req.params.conversation_id?.toString() ?? '';

  try {
    // use hasMember here
    const conversation = await ConversationService.findConversation(conversationId);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!conversation.memberIds.includes(userObjectId)) {
      res.status(401).send({
        success: false,
        message: 'Not a member of the conversation',
      });
    }

    const messages = await ConversationService.getConversationMessages(conversationId);

    res.status(200).send({
      success: true,
      message: 'Conversation messages were successfully found',
      messages: messages.map((message) => message.toObject()),
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export { handleGetConversation, handleGetConversationsBySearch, handleGetConversationMessages };
