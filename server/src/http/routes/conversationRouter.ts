import { Router } from 'express';
import {
  handleGetConversation,
  handleGetConversationMessages,
} from '../services/conversationServices';

const conversationRouter = Router({ mergeParams: true });

conversationRouter.get('/', handleGetConversation);
conversationRouter.get('/messages', handleGetConversationMessages);

export default conversationRouter;
