import { Router } from 'express';
import { attachSession, validateUser } from '../middleware/authValidation';
import {
  handleAddFriendRequest,
  handleGetFriendRequests,
  handleRemoveFriend,
  handleRemoveFriendRequest,
} from '../services/friendServices';
import { handleGetBasicUserInformation } from '../services/userServices';
import conversationRouter from './conversationRouter';

const userRouter = Router({ mergeParams: true });

userRouter.get('/', handleGetBasicUserInformation);

userRouter.use(attachSession, validateUser);
userRouter.get('/friend-requests', handleGetFriendRequests);
userRouter.post('/friend-requests', handleAddFriendRequest);
userRouter.delete('/friend-requests', handleRemoveFriendRequest);
userRouter.delete('/friends', handleRemoveFriend);

userRouter.use('/conversations/:conversation_id', conversationRouter);

export default userRouter;
