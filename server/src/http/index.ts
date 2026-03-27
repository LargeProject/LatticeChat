import auth from "../util/auth";
import { toNodeHandler } from "better-auth/node";
import { Router } from "express";
import { handleLog } from "./middleware/loggerMiddleware";
import userRouter from "./routes/userRouter";

const apiRouter = Router();

apiRouter.use(handleLog);
apiRouter.all("/auth/*any", toNodeHandler(auth));
apiRouter.use("/users/:id", userRouter);

export default apiRouter;

