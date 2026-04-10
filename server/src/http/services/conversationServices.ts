import { Service, UserRequest } from '../types';
import { handleHttpError } from '../../util/error';
import { getConversation, getConversationMessages } from '../../db';
import mongoose from 'mongoose';

const handleGetConversation: Service = async (req: UserRequest, res) => {
  const userId = req.params.user_id?.toString() ?? '';
  const conversationId = req.params.conversation_id?.toString() ?? '';

  try {
    const conversation = await getConversation(conversationId);
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

const handleGetConversationMessages: Service = async (req: UserRequest, res) => {
  const userId = req.params.user_id?.toString() ?? '';
  const conversationId = req.params.conversation_id?.toString() ?? '';

  try {
    const conversation = await getConversation(conversationId);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!conversation.memberIds.includes(userObjectId)) {
      res.status(401).send({
        success: false,
        message: 'Not a member of the conversation',
      });
    }

    const messages = await getConversationMessages(conversationId);

    res.status(200).send({
      success: true,
      message: 'Conversation messages were successfully found',
      messages: messages.map((message) => message.toObject()),
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export { handleGetConversation, handleGetConversationMessages };
