import { Router } from 'express';
import { handleEmailTaken, handleEmailVerified, handleUsernameTaken } from '../services/authServices';

const authRouter = Router();

authRouter.post('/email-taken', handleEmailTaken);
authRouter.post('/email-verified', handleEmailVerified);
authRouter.get('/username-taken', handleUsernameTaken);

export default authRouter;
