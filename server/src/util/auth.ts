import { createMongoClient } from "./database.js";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { bearer } from "better-auth/plugins";

const client = createMongoClient();
const db = client.db();

const auth = betterAuth({
  plugins: [bearer()],
  baseURL: process.env.BASE_URL,
  database: mongodbAdapter(db, { client }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {},
  },
});

export default auth;

