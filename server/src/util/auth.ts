import {betterAuth} from "better-auth";
import {mongodbAdapter} from "@better-auth/mongo-adapter";
import {bearer} from "better-auth/plugins";
import transporter, {sendVerificationEmail} from "./mailer.js";
import mongoose from 'mongoose';
import type { Db } from "mongodb";

const host = process.env.HOST;
const port = process.env.PORT;

const auth = betterAuth({
  plugins: [bearer()],
  baseURL: `http://${host}:${port}`,
  database: mongodbAdapter(mongoose.connection as unknown as Db),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendVerificationEmail(user.email, url);
    }
  },

  user: {
    modelName: "users",
    fields: {
      name: "username"
    }
  }

});

export default auth;

async function attemptSignUp(username: string, email: string, password: string) {
  return await auth.api.signUpEmail({
    body: {
      name: username,
      email: email,
      password: password
    },
    asResponse: true
  });
}

async function attemptEmailVerification(token: string) {
  return await auth.api.verifyEmail({
    query: {
      token: token
    },
    asResponse: true
  })
}

async function getSession(token: string) {
  return await auth.api.getSession({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    asResponse: true
  })
}

async function attemptLogin(email: string, password: string) {
  return auth.api.signInEmail({
    body: {
      email: email,
      password: password
    },
    asResponse: true
  });
}

export {attemptSignUp, attemptEmailVerification, getSession, attemptLogin};