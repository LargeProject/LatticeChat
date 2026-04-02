import * as z from "zod";
import "dotenv/config";

const envSchema = z.object({
  HOST: z.string().nonempty(),
  PORT: z.string().nonempty(),
  ALLOW_ORIGIN: z.string().nonempty(),
  BETTER_AUTH_SECRET: z.string().nonempty(),
  DB_NAME: z.string().nonempty(),
  DB_USERNAME: z.string().nonempty(),
  DB_PASSWORD: z.string().nonempty(),
  DB_HOSTNAME: z.string().nonempty(),
  DB_PORT: z.string().nonempty(),
  SENDGRID_API_KEY: z.string().nonempty(),
});

export const ENV = envSchema.parse({
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  ALLOW_ORIGIN: process.env.ALLOW_ORIGIN,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOSTNAME: process.env.DB_HOSTNAME,
  DB_PORT: process.env.DB_PORT,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
});
