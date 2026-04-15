import { Router } from 'express';
import { attachSession, validateUser } from '../middleware/authValidation';
import {
  handleAcceptFriendRequest,
  handleAddFriendRequest,
  handleGetFriendRequests,
  handleRemoveFriend,
  handleRemoveFriendRequest,
} from '../services/friendServices';
import { handleDeleteUser, handleGetBasicUserInformation } from '../services/userServices';
import conversationRouter from './conversationRouter';
import { handleGetConversationsBySearch } from '../services/conversationServices';

const userRouter = Router({ mergeParams: true });

// non-auth restricted endpoints
userRouter.get('/', handleGetBasicUserInformation);

// auth restricted endpoints
userRouter.use(attachSession, validateUser);

userRouter.delete('/', handleDeleteUser);

userRouter.use('/conversations/:conversation_id', conversationRouter);
userRouter.get('/conversations', handleGetConversationsBySearch);

userRouter.get('/friend-requests', handleGetFriendRequests);
userRouter.post('/friend-requests', handleAddFriendRequest);
userRouter.patch('/friend-requests', handleAcceptFriendRequest);
userRouter.delete('/friend-requests', handleRemoveFriendRequest);
userRouter.delete('/friends', handleRemoveFriend);

export default userRouter;
