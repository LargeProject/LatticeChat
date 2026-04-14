import type { Middleware, UserRequest } from '../types.js';
import auth from '../../util/auth.js';
import { InvalidTokenError } from '../../util/error';

const attachSession: Middleware = async (req: UserRequest, res, next) => {
  const session = await auth.api.getSession({
    headers: {
      Authorization: req.headers.authorization,
    },
  });

  const requestedUserId = req.params.user_id ?? '';
  const tokenUserId = session?.user.id ?? '';

  // For /me endpoint, always attach session if it exists
  if (!requestedUserId || requestedUserId === 'me' || requestedUserId === tokenUserId) {
    req.userInfo = session?.user ?? null;
  } else {
    req.userInfo = null;
  }

  next();
};

const validateUser: Middleware = async (req: UserRequest, res, next) => {
  const userInfo = req.userInfo;

  if (!userInfo || !userInfo.id) {
    const error = new InvalidTokenError();
    error.handle(res);
    return;
  }

  const requestedUserId = req.params.user_id ?? '';

  // For /me endpoint, any authenticated user is allowed
  if (requestedUserId && requestedUserId !== 'me' && requestedUserId !== userInfo.id) {
    const error = new InvalidTokenError();
    error.handle(res);
    return;
  }

  next();
};

export { attachSession, validateUser };
