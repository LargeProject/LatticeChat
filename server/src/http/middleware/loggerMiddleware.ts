import { inspect } from "node:util";
import type { Middleware } from "../types";

const logger: Middleware = (req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
};

export { logger };

