import {Router} from "express";
import {handleLog} from "./middleware/loggerMiddleware.js";
import authRouter from "./routes/authRouter.js";

const apiRouter = Router();

apiRouter.use(handleLog);
apiRouter.use("/auth", authRouter);

export default apiRouter;