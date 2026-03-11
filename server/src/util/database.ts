import {MongoClient} from 'mongodb';

const username= process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const port = process.env.DB_PORT;
const ip = process.env.IP;

const uri = `mongodb://${username}:${password}@${ip}:${port}/`;

function createClient() {
  return new MongoClient(uri);
}

async function createMongoConnection() {
  const client = createClient();
  await client.connect();

  return client;
}

export { createMongoConnection, createClient };