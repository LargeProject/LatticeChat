import { ENV } from "./env";
import zxcvbn from "zxcvbn";
import mongoose from "mongoose";
import {APIError, betterAuth} from "better-auth";
import { bearer, emailOTP, username } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { connectMongoDB } from "../db";
import {
  sendDuplicateEmailNotification,
  sendEmailVerificationOTP,
  sendForgetPasswordOTP,
} from "./mailer";
import { createAuthMiddleware } from "@better-auth/core/api";
import { authUserAdditionalFields } from "../db/schemas/User";

await connectMongoDB();
const client = mongoose.connection.getClient();
const db = client.db();

const baseURL = ENV.HOST + ":" + ENV.PORT;

const auth = betterAuth({
  plugins: [
    bearer(),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
      usernameValidator: (username) => {
        return /^[a-zA-Z0-9_-]+$/.test(username);
      },
    }),
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
  trustedOrigins: [ENV.ALLOW_ORIGIN],
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
    additionalFields: authUserAdditionalFields
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if(ctx.path != "/sign-up/email" && ctx.path != "/email-otp/request-password-reset") return;

      let password = "";
      if (ctx.path == "/sign-up/email") {
        password = ctx.body.password;
      } else if (ctx.path == "/email-otp/request-password-reset") {
        password = ctx.body.newPassword;
      }

      const { score, feedback } = zxcvbn(password);
      if (score < 3) {
        throw new APIError("BAD_REQUEST", {
          success: false,
          message: "Password is too weak"
        });
      }
    })
  }
});

export default auth;

async function attemptGetSession(token: string) {
  return await auth.api.getSession({
    headers: {
      Authorization: `Bearer ${token}`,
    },
    asResponse: true,
  });
}

export { attemptGetSession };
