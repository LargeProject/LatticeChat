import {inspect} from "node:util";
import type {Middleware} from "../types.js";

const handleLog: Middleware = (req, res, next) => {
  console.log(new Date().toISOString() + " [LOG] " + inspect(req));
  next();
}

export {handleLog}