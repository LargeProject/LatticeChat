import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { request } from '../util/http';
import { resetDatabase } from '../util/database';
import { destroySocketEnvironment, environment, initSocketEnvironment } from '../util/ws';

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

describe('socket io create conversation', () => {
  it('should return success and create conversation', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);
    const account3 = await request.createAndSignIn(account3Credentials);
    await request.makeFriends(account1, account2);
    await request.makeFriends(account1, account3);

    const client = environment.createClient();
    await client.emitHandShake({ jwt: account1.jwt, id: account1.userId });
    const createResponse = await client.emitCreateConversation([account1, account2, account3]);
    const createdConversationId = createResponse.conversationId;

    const conversationsResponse1 = await request.searchConversation(account1.jwt, '');
    const conversationsResponse2 = await request.searchConversation(account2.jwt, '');
    const conversationsResponse3 = await request.searchConversation(account3.jwt, '');
    const convs1 = conversationsResponse1?.body?.conversations ?? null;
    const convs2 = conversationsResponse2?.body?.conversations ?? null;
    const convs3 = conversationsResponse3?.body?.conversations ?? null;

    expect(createResponse.success).toBe(true);
    expect(convs1.length).toBeGreaterThan(0);
    expect(convs2.length).toBeGreaterThan(0);
    expect(convs3.length).toBeGreaterThan(0);
    expect(convs1).toEqual(expect.arrayContaining([expect.objectContaining({ id: createdConversationId })]));
    expect(convs2).toEqual(expect.arrayContaining([expect.objectContaining({ id: createdConversationId })]));
    expect(convs3).toEqual(expect.arrayContaining([expect.objectContaining({ id: createdConversationId })]));
  });
});
