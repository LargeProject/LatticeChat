import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { request } from '../util/http';
import { resetDatabase } from '../util/database';
import { createWaitHook, destroySocketEnvironment, environment, initSocketEnvironment } from '../util/ws';
import { CreateMessage } from '@latticechat/shared';

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

describe('socket-io create message (server bound)', () => {
  it('should return success and create message', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);
    await request.makeFriends(account1, account2);

    const { body } = await request.searchConversation(account1.jwt, '');
    const conversationId = body.conversations[0].id;

    const createMessagePayLoad: CreateMessage = {
      conversationId: conversationId,
      senderId: account1.userId,
      content: 'Hello!',
    };

    const client = environment.createClient();
    await client.emitHandShake({ jwt: account1.jwt, id: account1.userId });
    const createMessageResponse = await client.emit('createMessage', createMessagePayLoad);

    const fetchMessageResponse = await request.fetchConversationMessages(account1.jwt, conversationId);
    const messages = fetchMessageResponse?.body?.messages ?? null;

    expect(createMessageResponse.success).toBe(true);
    expect(messages.length).toBe(1);
    expect(messages[0]).toMatchObject({
      conversationId: conversationId,
      senderId: account1.userId,
      content: 'Hello!',
    });
  });
});

describe('socket-io receive message (client bound)', () => {
  it('should return success and receive message', async () => {
    const { done, waitUntilDone } = createWaitHook();

    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);
    await request.makeFriends(account1, account2);

    const { body } = await request.searchConversation(account1.jwt, '');
    const conversationId = body.conversations[0].id;

    const client1 = environment.createClient();
    const client2 = environment.createClient();
    await client1.emitHandShake({ jwt: account1.jwt, id: account1.userId });
    await client2.emitHandShake({ jwt: account2.jwt, id: account2.userId });

    client2.on('newMessage', (res) => done(res));

    const createMessagePayLoad: CreateMessage = {
      conversationId: conversationId,
      senderId: account1.userId,
      content: 'Hello!',
    };

    await client1.emit('createMessage', createMessagePayLoad);
    const receiveMessageResponse = await waitUntilDone();

    expect(receiveMessageResponse).toMatchObject({
      conversationId: conversationId,
      senderId: account1.userId,
      content: 'Hello!',
    });
  });
});
