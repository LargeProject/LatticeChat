import { Router } from 'express';
import { validateUser } from '../middleware/authValidation';
import {
  handleAddFriendRequest,
  handleRemoveFriend,
  handleRemoveFriendRequest,
} from '../services/friendServices';
import { handleGetBasicUserInformation } from '../services/userServices';

const userRouter = Router({ mergeParams: true });

userRouter.get('', handleGetBasicUserInformation);

userRouter.post('/friend-requests', validateUser, handleAddFriendRequest);
userRouter.delete('/friend-requests', validateUser, handleRemoveFriendRequest);
userRouter.delete('/friends', validateUser, handleRemoveFriend);

export default userRouter;