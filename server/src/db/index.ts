import mongoose from 'mongoose';

const username= process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const port = process.env.DB_PORT;
const ip = process.env.IP;
const dbName = process.env.DB_NAME;

const uri = `mongodb://${username}:${password}@${ip}:${port}/${dbName}?authSource=admin&replicaSet=rs0`;

export function connectMongoDB() {
  mongoose.connect(uri);
}