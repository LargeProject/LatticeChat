import { Router } from "express";
import { validateUser } from "../middleware/authValidation";

const userRouter = Router({ mergeParams: true });

userRouter.use(validateUser);

export default userRouter;