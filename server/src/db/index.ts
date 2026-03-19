import { ENV } from "../util/env";
import mongoose from "mongoose";

const uri = `mongodb://${ENV.DB_USERNAME}:${ENV.DB_PASSWORD}@${ENV.DB_HOSTNAME}:${ENV.DB_PORT}/${ENV.DB_NAME}?authSource=admin&replicaSet=rs0&directConnection=true`;

export async function connectMongoDB()
{
  await mongoose.connect(uri);
}

