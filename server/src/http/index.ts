import {Router} from "express";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import {handleLog} from "./middleware/loggerMiddleware.js";

const apiRouter = Router();

apiRouter.use(handleLog);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users/:id", userRouter);

export default apiRouter;