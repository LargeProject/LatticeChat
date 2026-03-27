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
    username(),
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
      },
    },
  },
});

export default auth;
