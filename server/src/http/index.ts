import auth from '../util/auth';
import { toNodeHandler } from 'better-auth/node';
import { Router } from 'express';
import userRouter from './routes/userRouter';
import authRouter from './routes/authRouter';
import { attachSession, validateUser } from './middleware/authValidation';
import { handleGetCurrentUser } from './services/userServices';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.all('/auth/*any', toNodeHandler(auth));

// Current user endpoint (must come before parameterized /users/:user_id route)
apiRouter.get('/users/me', attachSession, validateUser, handleGetCurrentUser);

apiRouter.use('/users/:user_id', userRouter);
apiRouter.use('/status', (req, res) => res.status(200).json({ ok: true }));

export default apiRouter;
