import * as z from 'zod';
import 'dotenv/config';
import { LogLevels } from './log';

const envSchema = z.object({
  HOST: z.string().nonempty(),
  PORT: z.string().nonempty(),
  ALLOW_ORIGIN: z.string().nonempty(),
  MONGO_URI: z.string().nonempty(),
  BETTER_AUTH_SECRET: z.string().nonempty(),
  SENDGRID_API_KEY: z.string().nonempty(),
  LOG_LEVEL: z.string().default(LogLevels.NONE),
});

export const ENV = envSchema.parse({
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  ALLOW_ORIGIN: process.env.ALLOW_ORIGIN,
  MONGO_URI: process.env.MONGO_URI,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  LOG_LEVEL: process.env.LOG_LEVEL,
});
