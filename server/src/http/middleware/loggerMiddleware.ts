import type { Middleware } from '../types';

const logger: Middleware = (req, res, next) => {
  console.log(`[${req.method}] ${req.url} ${JSON.stringify(req.body)}`);
  next();
};

export { logger };
