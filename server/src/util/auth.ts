import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { bearer, emailOTP } from "better-auth/plugins";
import { ENV } from "./env";
import mongoose from "mongoose";
import type { Db } from "mongodb";
import {sendDuplicateEmailNotification, sendEmailVerificationOTP, sendForgetPasswordOTP} from "./mailer.js";

const baseURL = ENV.HOST + ":" + ENV.PORT;

const auth = betterAuth({
  plugins: [
    bearer(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await sendEmailVerificationOTP(email, otp);
        } else if (type === "forget-password") {
          await sendForgetPasswordOTP(email, otp);
        }
      },
    })
  ],
  baseURL,
  database: mongodbAdapter(mongoose.connection as unknown as Db),
  emailAndPassword: {
    enabled: true,
    onExistingUserSignUp: async ({user}, request) => {
      if (user.emailVerified) {
        await sendDuplicateEmailNotification(user.email)
      }
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
