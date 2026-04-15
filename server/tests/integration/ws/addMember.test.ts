import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { request } from '../util/http';
import { resetDatabase } from '../util/database';
import { createWaitHook, destroySocketEnvironment, environment, initSocketEnvironment } from '../util/ws';
import { AddMember } from '@latticechat/shared';

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

const account4Credentials = {
  name: 'test4',
  email: 'test4@gmail.com',
  password: 'Test@Test.Test',
};

describe('socket-io add member (server bound)', () => {
  it('should return success an add member', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);
    const account3 = await request.createAndSignIn(account3Credentials);
    const account4 = await request.createAndSignIn(account4Credentials);
    await request.makeFriends(account1, account2);
    await request.makeFriends(account1, account3);
    await request.makeFriends(account1, account4);

    const client = environment.createClient();
    await client.emitHandShake({ jwt: account1.jwt, id: account1.userId });
    const { conversationId } = await client.emitCreateConversation([account1, account2, account3]);

    const addMemberPayload: AddMember = {
      conversationId: conversationId,
      userId: account4.userId,
    };

    const addMemberResponse = await client.emit('addMember', addMemberPayload);

    const conversationsResponse = await request.searchConversation(account1.jwt, '');
    const conversation = conversationsResponse.body.conversations.find(
      (conversation) => conversation.id == conversationId,
    );

    expect(addMemberResponse.success).toBe(true);
    expect(conversation.members).toMatchObject([
      { id: account1.userId },
      { id: account2.userId },
      { id: account3.userId },
      { id: account4.userId },
    ]);
  });
});

describe('socket-io add member (client bound)', () => {
  it('should return success and receive an added member', async () => {
    const { done, waitUntilDone } = createWaitHook();

    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);
    const account3 = await request.createAndSignIn(account3Credentials);
    const account4 = await request.createAndSignIn(account4Credentials);
    await request.makeFriends(account1, account2);
    await request.makeFriends(account1, account3);
    await request.makeFriends(account1, account4);

    const client1 = environment.createClient();
    await client1.emitHandShake({ jwt: account1.jwt, id: account1.userId });
    const { conversationId } = await client1.emitCreateConversation([account1, account2, account3]);

    const client2 = environment.createClient();
    await client2.emitHandShake({ jwt: account2.jwt, id: account2.userId });
    client2.on('newMember', (res) => done(res));

    const addMemberPayload: AddMember = {
      conversationId: conversationId,
      userId: account4.userId,
    };

    await client1.emit('addMember', addMemberPayload);
    const receiveAddMemberResponse = await waitUntilDone();

    expect(receiveAddMemberResponse).toMatchObject({
      conversationId: conversationId,
      userId: account4.userId,
      addedBy: account1.userId,
    });
  });
});
