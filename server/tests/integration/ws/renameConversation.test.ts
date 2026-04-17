import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { request } from '../util/http';
import { database, resetDatabase } from '../util/database';
import { createWaitHook, destroySocketEnvironment, environment, initSocketEnvironment } from '../util/ws';

beforeEach(async () => {
  await resetDatabase();
  await initSocketEnvironment();
});

afterEach(async () => {
  await destroySocketEnvironment();
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

const account3Credentials = {
  name: 'test3',
  email: 'test3@gmail.com',
  password: 'Test@Test.Test',
};

describe('socket-io rename conversation (server bound)', () => {
  it('should return success and rename conversation', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);
    const account3 = await request.createAndSignIn(account3Credentials);
    await request.makeFriends(account1, account2);
    await request.makeFriends(account1, account3);

    const client = environment.createClient();
    await client.emitHandShake({ jwt: account1.jwt, id: account1.userId });
    const { conversationId } = await client.emitCreateConversation([account1, account2, account3]);

    const renamePayload = {
      conversationId: conversationId,
      newName: 'New Conversation Name',
    };

    const renameResponse = await client.emit('renameConversation', renamePayload);

    const conversationsResponse = await request.searchConversation(account1.jwt, '');
    const conversation = conversationsResponse.body.conversations.find((c: any) => c.id === conversationId);

    expect(renameResponse.success).toBe(true);
    expect(conversation.name).toBe('New Conversation Name');
  });
});

describe('socket-io rename conversation (client bound)', () => {
  it('should notify other members about renamed conversation', async () => {
    const { done, waitUntilDone } = createWaitHook();

    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);
    const account3 = await request.createAndSignIn(account3Credentials);
    await request.makeFriends(account1, account2);
    await request.makeFriends(account1, account3);

    const client1 = environment.createClient();
    await client1.emitHandShake({ jwt: account1.jwt, id: account1.userId });
    const { conversationId } = await client1.emitCreateConversation([account1, account2, account3]);

    const client2 = environment.createClient();
    await client2.emitHandShake({ jwt: account2.jwt, id: account2.userId });
    client2.on('conversationUpdated', (res) => done(res));

    await client1.emit('renameConversation', { conversationId, newName: 'Cool Name' });
    const receivePayload = await waitUntilDone();

    expect(receivePayload).toMatchObject({ conversationId: conversationId, name: 'Cool Name' });
  });
});

describe('socket-io rename conversation (direct message)', () => {
  it('should fail to rename a direct message conversation', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    const conversation = await database.createConversation([account1.userId, account2.userId], true);

    const client = environment.createClient();
    await client.emitHandShake({ jwt: account1.jwt, id: account1.userId });

    const renameResponse = await client.emit('renameConversation', {
      conversationId: conversation.id,
      newName: 'Should Not Work',
    });

    expect(renameResponse.success).toBe(false);
  });
});
