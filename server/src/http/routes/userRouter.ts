import { Router } from "express";
import { validateUser } from "../middleware/authValidation";
import {
  handleAddOutgoingFriendRequest,
  handleRemoveFriend,
  handleRemoveIncomingFriendRequest,
  handleRemoveOutgoingFriendRequest
} from "../services/friendServices";

const userRouter = Router({ mergeParams: true });

userRouter.use(validateUser);
userRouter.post("/outgoing-friend-request", handleAddOutgoingFriendRequest);
userRouter.delete("/outgoing-friend-request", handleRemoveOutgoingFriendRequest);
userRouter.delete("/incoming-friend-request", handleRemoveIncomingFriendRequest);
userRouter.delete("/friends", handleRemoveFriend);

export default userRouter;