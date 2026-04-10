import { ENV } from '../util/env';
import mongoose from 'mongoose';

const uri = ENV.MONGO_URI;

export async function connectMongoDB() {
  await mongoose.connect(uri);
}

export * from './service';
export * from './models';
