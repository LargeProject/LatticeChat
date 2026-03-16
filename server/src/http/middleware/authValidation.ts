import type {Middleware} from "../types.js";

const validateSignUp: Middleware = (req, res, next) => {

  const { username, email, password } = req.body;

  // TODO: implement signup sanitization and validation (or use better-auth's built-in credential validation)

  next();
}

export {validateSignUp}