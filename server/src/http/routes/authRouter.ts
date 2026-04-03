import { Router } from 'express';
import {
  handleEmailTaken,
  handleUsernameTaken,
} from '../services/authServices';

const authRouter = Router();

authRouter.get('/email-taken', handleEmailTaken);
authRouter.get('/username-taken', handleUsernameTaken);

export default authRouter;
