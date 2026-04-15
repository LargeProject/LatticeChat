import { ENV } from './env';
import zxcvbn from 'zxcvbn';
import mongoose from 'mongoose';
import { betterAuth } from 'better-auth';
import { bearer, emailOTP } from 'better-auth/plugins';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { connectMongoDB, UserService } from '../db';
import { sendDuplicateEmailNotification, sendEmailVerificationOTP, sendForgetPasswordOTP } from './mailer';
import { createAuthMiddleware } from '@better-auth/core/api';
import { authUserAdditionalFields } from '../db/schemas/User';

await connectMongoDB();
const client = mongoose.connection.getClient();
const db = client.db();

const baseURL = ENV.HOST + ':' + ENV.PORT;

const auth = betterAuth({
  plugins: [
    bearer(),
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
    minPasswordLength: 8,
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
    additionalFields: {
      publicKey: {
        type: 'string',
        required: false,
      },
    },
  },
  user: {
    modelName: 'users',
    additionalFields: authUserAdditionalFields,
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // password validation middleware
      if (ctx.path == '/sign-up/email' || ctx.path == '/email-otp/reset-password' || ctx.path == '/change-password') {
        let password = '';
        if (ctx.path == '/change-password') {
          password = ctx.body.newPassword;
        } else {
          password = ctx.body.password;
        }

        const { score, feedback } = zxcvbn(password);
        if (score < 3) {
          throw ctx.error(400, {
            code: 'INVALID_PASSWORD',
            message: 'Password is not strong enough',
          });
        }
      }

      // email and name validation middleware
      if (ctx.path == '/sign-up/email') {
        // email validation
        const email = ctx.body.email;
        if (await UserService.isEmailTaken(email)) {
          throw ctx.error(400, {
            code: 'EMAIL_TAKEN',
            message: 'Email is taken',
          });
        }

        // username validation
        const name = ctx.body.name;

        if (name.length < 3 || name.length > 20) {
          throw ctx.error(400, {
            code: 'INVALID_USERNAME_LENGTH',
            message: 'Username length must be between 3 and 20 characters',
          });
        }

        if (!/^[\w.]+$/.test(name)) {
          throw ctx.error(400, {
            code: 'INVALID_USERNAME_PATTERN',
            message: 'Username must only contain letters and numbers',
          });
        }

        if (await UserService.isUsernameTaken(name)) {
          throw ctx.error(400, {
            code: 'USERNAME_TAKEN',
            message: 'Username is taken',
          });
        }
      }
    }),
  },
});

export default auth;
