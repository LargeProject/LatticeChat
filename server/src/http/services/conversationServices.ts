import type { Service, UserRequest } from '../types';
import { handleHttpError } from '../../util/error';
import { ConversationService, UserService } from '../../db';

const handleGetConversation: Service = async (req: UserRequest, res) => {
  const userId = req.userInfo?.id ?? '';
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
  const userId = req.userInfo?.id ?? '';
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
  const userId = req.userInfo?.id ?? '';
  const conversationId = req.params.conversation_id?.toString() ?? '';

  try {
    const conversation = await ConversationService.findConversation(conversationId);
    if (!conversation.hasMember(userId)) {
      res.status(401).send({
        success: false,
        message: 'Not a member of the conversation',
      });
    }

    const messages = await ConversationService.getConversationMessages(conversationId);

    res.status(200).send({
      success: true,
      message: 'Conversation messages were successfully found',
      messages: messages.map((message) => {
        return {
          id: message.id,
          senderId: message.senderId,
          conversationId: message.conversationId.toString(),
          content: message.content,
          createdAt: message.createdAt,
        };
      }),
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export { handleGetConversation, handleGetConversationsBySearch, handleGetConversationMessages };
