import type { Middleware, UserRequest } from '../types.js';
import auth from '../../util/auth.js';

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
    res.status(401).send({
      success: false,
      message: 'Invalid Token',
    });
    return;
  }

  const requestedUserId = req.params.user_id ?? '';
  
  // For /me endpoint, any authenticated user is allowed
  if (requestedUserId && requestedUserId !== 'me' && requestedUserId !== userInfo.id) {
    res.status(401).send({
      success: false,
      message: 'Invalid Token',
    });
    return;
  }

  next();
};

export { attachSession, validateUser };
