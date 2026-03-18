import { toNodeHandler } from "better-auth/node";
import { Router } from "express";
import auth from "../util/auth";
import { handleLog } from "./middleware/loggerMiddleware";

const apiRouter = Router();

apiRouter.use(handleLog);
apiRouter.all("/api/auth/*", toNodeHandler(auth));

export default apiRouter;

