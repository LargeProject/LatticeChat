import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { connectDatabase, database, disconnectDatabase, resetDatabase } from '../integration/util/database';
import { ConversationService, UserService } from '../../src/db';
import { CreateConversation, RemovePrivateConversation } from '@latticechat/shared';
import mongoose from 'mongoose';

beforeEach(async () => {
  await connectDatabase();
  await resetDatabase();
});

afterEach(async () => {
  await disconnectDatabase();
});

expect.extend({
  toContainObjectId(received: mongoose.Types.ObjectId[], expected: mongoose.Types.ObjectId) {
    const { utils } = this;
    const pass = received.some((id) => id.toString() == expected.toString());

    return {
      pass,
      message: () =>
        `expected ${utils.printReceived(received)} to ${pass ? 'not ' : ''} contain ${utils.printExpected(expected)}`,
    };
  },
});

describe('ConversationService - getConversationMessages', () => {
  it('should return the created conversation message', async () => {
    const user1 = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const user2 = await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });
    const conversation = await database.createConversation([user1.id, user2.id], true);
    const message = await database.createFakeDirectMessage(conversation.id, user2.id, 'Hello!');

    const foundMessages = await ConversationService.getConversationMessages(conversation.id);

    expect(foundMessages[0].toObject()).toMatchObject(message.toObject());
  });
});

describe('ConversationService - findConversation', () => {
  it('should return the created conversation', async () => {
    const user1 = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const user2 = await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });
    const conversation = await database.createConversation([user1.id, user2.id], true);

    const foundConversation = await ConversationService.findConversation(conversation.id);

    expect(foundConversation.toObject()).toMatchObject(conversation.toObject());
  });
});

describe('ConversationService - createConversation', () => {
  it('should return the created conversation', async () => {
    const user1 = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const user2 = await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });

    const createConversationPayload: CreateConversation = {
      memberIds: [user1.id, user2.id],
    };
    const conversation = await ConversationService.createConversation(createConversationPayload, true);
    const foundConversation = await ConversationService.findConversation(conversation.id);

    expect(foundConversation.toObject()).toMatchObject(conversation.toObject());
  });
});

describe('ConversationService - removePrivateConversation', () => {
  it('should remove private conversation', async () => {
    const user1 = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const user2 = await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });
    const conversation = await database.createConversation([user1.id, user2.id], true);

    const removePrivateConversationPayload: RemovePrivateConversation = {
      memberIds: [user1.id, user2.id],
    };
    await ConversationService.removePrivateConversation(removePrivateConversationPayload);

    let error = null;
    try {
      await ConversationService.findConversation(conversation.id);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error?.code).toBe('CONVERSATION_NOT_FOUND');
  });
});

describe('ConversationService - addMemberToConversation', () => {
  it('should remove private conversation', async () => {
    const user1 = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const user2 = await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });
    const user3 = await database.createFakeUser({ name: 'test3', email: 'test3@gmail.com' });
    let user4 = await database.createFakeUser({ name: 'test4', email: 'test4@gmail.com' });
    let conversation = await database.createConversation([user1.id, user2.id, user3.id], false);

    await UserService.createFriendRequest(user1.id, user4.id);
    await UserService.acceptFriendRequest(user1.id, user4.id);

    await ConversationService.addMemberToConversation({
      conversationId: conversation.id,
      userId: user4.id,
      adderId: user1.id,
    });

    user4 = await UserService.findUser(user4.id);

    expect(user4.conversationIds.length).toBe(2);
    // @ts-ignore (this method is declared at the top of this file)
    expect(user4.conversationIds).toContainObjectId(conversation._id);
  });
});
