import auth from '../util/auth';
import { toNodeHandler } from 'better-auth/node';
import { Router } from 'express';
import userRouter from './routes/userRouter';
import authRouter from './routes/authRouter';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.all('/auth/*any', toNodeHandler(auth));
apiRouter.use('/users/:user_id', userRouter);

export default apiRouter;
