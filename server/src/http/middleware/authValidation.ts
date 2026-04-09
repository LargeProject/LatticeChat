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

  if (requestedUserId == tokenUserId) {
    req.userInfo = session?.user ?? null;
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
    res.status(401).send({
      success: false,
      message: 'Invalid Token',
    });
    return;
  }

  next();
};

export { attachSession, validateUser };
