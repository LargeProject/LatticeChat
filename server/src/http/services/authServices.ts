import type {Response as ExpressResponse} from 'express';
import type {Service} from "../types.js";
import {attemptEmailVerification, attemptGetSession, attemptSignUp, attemptLogin} from "../../util/auth.js";

const handleSignUp: Service = async (req, res) => {
  const { username, email, password } = req.body;
  const authResponse = await attemptSignUp(username, email, password);

  // TODO: add specific error responses
  if(authResponse.status !== 200) {
    await sendDefaultError(res, authResponse);
    return;
  }

  res.status(200).send({
    success: true,
    message: "Sign up successful, please check your account email"
  });
}

const handleEmailVerify: Service = async (req, res) => {
  const token = req.query.token?.toString() ?? "";
  const authResponse = await attemptEmailVerification(token);

  // TODO: add specific error responses
  if(authResponse.status !== 200) {
    await sendDefaultError(res, authResponse);
    return;
  }

  res.status(200).send({
    success: true,
    message: "Email verification successful"
  });
}

const handleLogin: Service = async (req, res) => {
  const { email, password } = req.body;
  const authResponse = await attemptLogin(email, password);

  // TODO: add specific error responses
  if(authResponse.status !== 200) {
    await sendDefaultError(res, authResponse);
    return;
  }

  const body = await authResponse.json() as any;
  const token = authResponse.headers.get('set-auth-token');
  const userId = body.user.id;

  res.status(200).send({
    success: true,
    message: "Login successful",
    id: userId,
    token: token,
  });
}

const handleLogout: Service = (req, res) => {
  res.send("logout"); // temporary
}

//... TODO: add more auth handlers.

export { handleSignUp, handleLogin, handleLogout, handleEmailVerify}

// temporary
async function sendDefaultError(serverResponse: ExpressResponse, authResponse: Response) {
  serverResponse.status(500).send({
    success: false,
    message: "Internal Server Error",
    auth_headers: Object.fromEntries(authResponse.headers),
    auth_message: (await authResponse.json() as any).message,
    auth_status: authResponse.status
  });
}