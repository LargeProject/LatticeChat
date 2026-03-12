import {createMongoClient} from "./database.js";
import {betterAuth} from "better-auth";
import {mongodbAdapter} from "@better-auth/mongo-adapter";
import {bearer} from "better-auth/plugins";

const ip = process.env.IP;
const port = process.env.PORT;

const client = createMongoClient();
const db = client.db();

const auth = betterAuth({
  plugins: [bearer()],
  baseURL: `http://${ip}:${port}`,
  database: mongodbAdapter(db, {client}),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      /* TODO: add fields later... */
    }
  },

});

export default auth;