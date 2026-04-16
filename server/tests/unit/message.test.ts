import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { connectDatabase, database, disconnectDatabase, resetDatabase } from '../integration/util/database';
import { ConversationService, MessageService } from '../../src/db';
import { CreateMessage } from '@latticechat/shared';

beforeEach(async () => {
  await connectDatabase();
  await resetDatabase();
});

afterEach(async () => {
  await disconnectDatabase();
});

describe('MessageService - createMessage', () => {
  it('should return the created conversation message', async () => {
    const user1 = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const user2 = await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });
    let conversation = await database.createConversation([user1.id, user2.id], true);

    const createMessagePayload: CreateMessage = {
      conversationId: conversation.id,
      senderId: user1.id,
      content: 'Hello!',
    };
    const message = await MessageService.createMessage(createMessagePayload);
    let foundMessages = await ConversationService.getConversationMessages(conversation.id);

    expect(foundMessages.length).toBe(1);
    expect(foundMessages[0].toObject()).toMatchObject(message.toObject());
  });
});
