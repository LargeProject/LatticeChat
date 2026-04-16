import { describe, it, expect, beforeEach } from 'vitest';
import { request } from '../util/http';
import { database, resetDatabase } from '../util/database';

beforeEach(async () => {
  await resetDatabase();
});

const account1Credentials = {
  name: 'test1',
  email: 'test1@gmail.com',
  password: 'Test@Test.Test',
};

const account2Credentials = {
  name: 'test2',
  email: 'test2@gmail.com',
  password: 'Test@Test.Test',
};

describe('GET /api/users/me/conversations?search=', () => {
  it('should return 200 and searched conversation', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    const conversation = await database.createConversation([account1.userId, account2.userId], true);
    await database.createFakeDirectMessage(conversation.id, account1.userId, 'Hello!');

    const response = await request.searchConversation(account1.jwt, 't');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.conversations.length).toBe(1);
    expect(response.body.conversations[0]).toMatchObject({
      id: conversation.id,
      isDirectMessage: true,
      members: [{ id: account1.userId }, { id: account2.userId }],
    });
  });
});

describe('GET /api/users/me/conversations/:conversation_id/messages', async () => {
  it('should return 200 and conversation messages', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    const conversation = await database.createConversation([account1.userId, account2.userId], true);
    const message1 = await database.createFakeDirectMessage(conversation.id, account1.userId, 'Hello!');
    const message2 = await database.createFakeDirectMessage(conversation.id, account2.userId, 'Hey!');

    const response = await request.fetchConversationMessages(account1.jwt, conversation.id);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.messages).toMatchObject([
      {
        _id: message1.id,
        senderId: account1.userId,
        conversationId: conversation.id,
        content: 'Hello!',
      },
      {
        _id: message2.id,
        senderId: account2.userId,
        conversationId: conversation.id,
        content: 'Hey!',
      },
    ]);
  });

  it('should return 404 and CONVERSATION_NOT_FOUND', async () => {
    const { jwt } = await request.createAndSignIn(account1Credentials);
    const invalidConversationId = '69dd90e1da7c1c0bf396791b';

    const response = await request.fetchConversationMessages(jwt, invalidConversationId);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('CONVERSATION_NOT_FOUND');
  });
});
