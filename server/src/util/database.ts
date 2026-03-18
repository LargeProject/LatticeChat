import { MongoClient } from "mongodb";
import { ENV } from "./env";

const uri = `mongodb://${ENV.DB_USERNAME}:${ENV.DB_PASSWORD}@${ENV.DB_HOSTNAME}:${ENV.DB_PORT}/`;

function createMongoClient() {
  return new MongoClient(uri);
}

async function createMongoConnection() {
  const client = createMongoClient();
  await client.connect();

  return client;
}

export { createMongoConnection, createMongoClient };

