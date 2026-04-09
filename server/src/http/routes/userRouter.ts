import { Router } from 'express';
import { attachSession, validateUser } from '../middleware/authValidation';
import {
  handleAddFriendRequest,
  handleGetFriendRequests,
  handleRemoveFriend,
  handleRemoveFriendRequest,
} from '../services/friendServices';
import {
  handleDeleteUser,
  handleGetBasicUserInformation,
} from '../services/userServices';
import conversationRouter from './conversationRouter';
import {
  handleCreateKeyExchangeRequest,
  handleDeleteKeyExchangeRequests,
  handleGetKeyExchangeRequests,
  handleGetPublicKey,
  handleSetPublicKey,
} from '../services/keyExchangeServices';

const userRouter = Router({ mergeParams: true });

// non-auth restricted endpoints
userRouter.get('/', handleGetBasicUserInformation);
userRouter.get('/public-key', handleGetPublicKey);

// auth restricted endpoints
userRouter.use(attachSession, validateUser);

userRouter.delete('/', handleDeleteUser);

userRouter.use('/conversations/:conversation_id', conversationRouter);

userRouter.get('/friend-requests', handleGetFriendRequests);
userRouter.post('/friend-requests', handleAddFriendRequest);
userRouter.delete('/friend-requests', handleRemoveFriendRequest);
userRouter.delete('/friends', handleRemoveFriend);

userRouter.post('/public-key', handleSetPublicKey);
userRouter.post('/key-exchange-requests', handleCreateKeyExchangeRequest);
userRouter.get('/key-exchange-requests', handleGetKeyExchangeRequests);
userRouter.delete('/key-exchange-requests', handleDeleteKeyExchangeRequests);

export default userRouter;
