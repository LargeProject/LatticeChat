import type {Middleware, UserRequest} from "../types.js";
import User from "../../db/models/User.js";
import {sendDuplicateEmail} from "../../util/mailer.js";
import {attemptGetSession} from "../../util/auth.js";

const validateSignUp: Middleware = async (req, res, next) => {
  const { username, email, password } = req.body;

  // TODO: implement signup sanitization and validation (or use better-auth's built-in credential validation)

  const duplicateEmail = await User.findOne({email: email});
  if (duplicateEmail != null && duplicateEmail.emailVerified) {
    sendDuplicateEmail(email);
  }

  next();
}

const validateUser: Middleware = async (req: UserRequest, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "") ?? "";
  const authResponse = await attemptGetSession(token);
  const body = await authResponse.json() as any;

  const requestedUserId = req.params.id ?? "";
  const tokenUserId = body?.user?.id ?? "";

  if (requestedUserId != tokenUserId) {
    res.status(401).send("Invalid token");
    return;
  }

  req.userSessionInfo = body;

  next();
}

export {validateSignUp, validateUser}