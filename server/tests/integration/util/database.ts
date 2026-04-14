import mongoose from 'mongoose';
import { Verification } from '../../../src/db/models';

export async function resetDatabase() {
  await mongoose.connection.dropDatabase();

  await mongoose.connection.db?.createCollection('accounts');
  await mongoose.connection.db?.createCollection('conversations');
  await mongoose.connection.db?.createCollection('friendrequests');
  await mongoose.connection.db?.createCollection('messages');
  await mongoose.connection.db?.createCollection('session');
  await mongoose.connection.db?.createCollection('users');
  await mongoose.connection.db?.createCollection('verification');
}

export class Database {
  async getOtp(email: string): Promise<string | null> {
    const verification = await Verification.findOne({
      identifier: { $regex: email, $options: 'i' },
    });

    return verification?.value.replace(':0', '') ?? null;
  }
}

export const database = new Database();
