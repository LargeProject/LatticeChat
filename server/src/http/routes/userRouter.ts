import { Router } from "express";
import { validateUser } from "../middleware/authValidation";
import {
  handleAddFriendRequest,
  handleRemoveFriend,
  handleRemoveFriendRequest
} from "../services/friendServices";

const userRouter = Router({ mergeParams: true });

userRouter.use(validateUser);
userRouter.post("/friend-requests/:target_id", handleAddFriendRequest);
userRouter.delete("/friend-requests/:target_id", handleRemoveFriendRequest);
userRouter.delete("/friends/:target_id", handleRemoveFriend);

export default userRouter;