import mongoose from 'mongoose';
import { Conversation, Message, User, Verification } from '../../../src/db/models';
import { ENV } from '../../../src/util/env';

export async function resetDatabase() {
  if (!ENV.MONGO_URI.includes('/test') || !ENV.MONGO_URI.includes('localhost')) {
    console.error('Wrong database used for integration testing');
    return;
  }
  const connection = mongoose.connection;
  await connection.dropDatabase();

  const db = connection.db;
  await db?.createCollection('accounts');
  await db?.createCollection('conversations');
  await db?.createCollection('friendrequests');
  await db?.createCollection('messages');
  await db?.createCollection('session');
  await db?.createCollection('users');
  await db?.createCollection('verification');
}

export class Database {
  async getOtp(email: string): Promise<string | null> {
    const verification = await Verification.findOne({
      identifier: { $regex: email, $options: 'i' },
    });

    return verification?.value.replace(':0', '') ?? null;
  }

  async createFakePrivateConversation(memberIds: string[]) {
    const conversation = await Conversation.create({
      isDirectMessage: true,
      memberIds: memberIds.map((memberId) => new mongoose.Types.ObjectId(memberId)),
    });

    await User.updateMany({ _id: { $in: memberIds } }, { $addToSet: { conversationIds: conversation._id } });

    return conversation;
  }

  async createFakeDirectMessage(conversationId: string, senderId: string, content: string) {
    return await Message.create({
      createdAt: Date.now(),
      senderId: senderId,
      conversationId: new mongoose.Types.ObjectId(conversationId),
      content: content,
    });
  }
}

export const database = new Database();
