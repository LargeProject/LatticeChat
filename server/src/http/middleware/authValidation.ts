import type { Middleware, UserRequest } from '../types.js';
import { attemptGetSession } from '../../util/auth.js';

const attachSession: Middleware = async (req: UserRequest, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') ?? '';
  const authResponse = await attemptGetSession(token);
  const body = (await authResponse.json()) as any;

  const requestedUserId = req.params.user_id ?? '';
  const tokenUserId = body?.user?.id ?? '';

  if (requestedUserId == tokenUserId) {
    req.userInfo = body?.user ?? null;
  } else {
    req.userInfo = null;
  }

  next();
};

const validateUser: Middleware = async (req: UserRequest, res, next) => {
  const userInfo = req.userInfo;

  const requestedUserId = req.params.user_id ?? '';
  const tokenUserId = userInfo?.id ?? '';

  if (requestedUserId != tokenUserId) {
    res.status(401).send('Invalid token');
    return;
  }

  next();
};

export { attachSession, validateUser };
