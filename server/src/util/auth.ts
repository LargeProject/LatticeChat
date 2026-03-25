import * as z from "zod";
import validator from "validator";
import { ENV } from "./env";
import mongoose from "mongoose";
import { betterAuth } from "better-auth";
import { bearer, emailOTP, jwt, username } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { connectMongoDB } from "../db";
import {
  sendDuplicateEmailNotification,
  sendEmailVerificationOTP,
  sendForgetPasswordOTP,
} from "./mailer";

await connectMongoDB();
const client = mongoose.connection.getClient();
const db = client.db();

const baseURL = "http://" + ENV.HOST + ":" + ENV.PORT;

const auth = betterAuth({
  plugins: [
    jwt(),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
      usernameValidator: (username) => {
        return /^[a-zA-Z0-9_-]+$/.test(username);
      }
    }),
    bearer(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await sendEmailVerificationOTP(email, otp);
        } else if (type === "forget-password") {
          await sendForgetPasswordOTP(email, otp);
        }
      },
    }),
  ],
  baseURL,
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 3,
    maxPasswordLength: 100,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user }, request) => {
      if (user.emailVerified) {
        await sendDuplicateEmailNotification(user.email);
      }
    },
  },
  user: {
    modelName: "users",
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
        validator: {
          input: z.string().refine(validator.isMobilePhone)
        }
      },
      biography: {
        type: "string",
        required: false,
        input: true,
      },
      friends: {
        type: "string",
        input: false,
        default: []
      },
      outgoingFriendRequests: {
        type: "string",
        input: false,
        default: []
      },
      incomingFriendRequests: {
        type: "string",
        input: false,
        default: []
      },
      conversations: {
        type: "string",
        input: false,
        default: []
      }
    },
  },
});

export default auth;

async function attemptGetSession(token: string) {
  return await auth.api.getSession({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    asResponse: true
  })
}

export { attemptGetSession };
