import { createMongoClient } from "./database.js";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { bearer } from "better-auth/plugins";
import { ENV } from "./env";

const client = createMongoClient();
const db = client.db();

const baseURL = ENV.HOST + ":" + ENV.PORT;

const auth = betterAuth({
  plugins: [bearer()],
  baseURL,
  database: mongodbAdapter(db, { client }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {},
  },
});

export default auth;
