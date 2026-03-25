import type { Middleware, UserRequest } from "../types.js";
import { attemptGetSession } from "../../util/auth.js";

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

export { validateUser }