import { ENV } from './env';
import zxcvbn from 'zxcvbn';
import mongoose from 'mongoose';
import { betterAuth } from 'better-auth';
import { bearer, emailOTP, username } from 'better-auth/plugins';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { connectMongoDB, isEmailTaken } from '../db';
import {
  sendDuplicateEmailNotification,
  sendEmailVerificationOTP,
  sendForgetPasswordOTP,
} from './mailer';
import { createAuthMiddleware } from '@better-auth/core/api';
import { authUserAdditionalFields } from '../db/schemas/User';

await connectMongoDB();
const client = mongoose.connection.getClient();
const db = client.db();

const baseURL = ENV.HOST + ':' + ENV.PORT;

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
        if (type === 'email-verification') {
          await sendEmailVerificationOTP(email, otp);
        } else if (type === 'forget-password') {
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

  account: {
    modelName: 'accounts',
  },
  user: {
    modelName: 'users',
    additionalFields: authUserAdditionalFields,
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // password validation middleware
      if (
        ctx.path == '/sign-up/email' ||
        ctx.path == '/email-otp/request-password-reset'
      ) {
        let password = '';
        if (ctx.path == '/sign-up/email') {
          password = ctx.body.password;
        } else if (ctx.path == '/email-otp/request-password-reset') {
          password = ctx.body.newPassword;
        }

        const { score, feedback } = zxcvbn(password);
        if (score < 3) {
          throw ctx.error(400, {
            code: 'INVALID_PASSWORD',
            message: 'Password is not strong enough',
          });
        }
      }

      // email validation middleware
      if (ctx.path == '/sign-up/email') {
        const email = ctx.body.email;

        const isTaken = await isEmailTaken(email);
        if (isTaken) {
          throw ctx.error(400, {
            code: 'EMAIL_TAKEN',
            message: 'Email is taken',
          });
        }
      }
    }),
  },
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
