import { describe, it, expect, beforeEach } from 'vitest';
import { request } from '../util/http';
import { resetDatabase } from '../util/database';

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

describe('GET api/users/me/friend-requests', () => {
  it('should return 200 and created friend request', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    await request.sendFriendRequest(account1.jwt, account2.username);

    const response = await request.fetchFriendRequests(account2.jwt);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.friendRequests.length).toBe(1);
    expect(response.body.friendRequests[0]).toMatchObject({
      fromId: account1.userId,
      toId: account2.userId,
    });
  });
});

describe('POST api/users/me/friend-requests', () => {
  it('should return 200 and send friend request', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    const sendResponse = await request.sendFriendRequest(account1.jwt, account2.username);
    const fetchResponse = await request.fetchFriendRequests(account1.jwt);

    expect(sendResponse.status).toBe(200);
    expect(sendResponse.body.success).toBe(true);

    expect(fetchResponse.body.friendRequests.length).toBe(1);
    expect(fetchResponse.body.friendRequests[0]).toMatchObject({
      fromId: account1.userId,
      toId: account2.userId,
    });
  });

  it('should return 409 and FRIEND_REQUEST_EXISTS', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    await request.sendFriendRequest(account1.jwt, account2.username);
    const response = await request.sendFriendRequest(account1.jwt, account2.username);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('FRIEND_REQUEST_EXISTS');
  });

  it('should return 409 and SELF_FRIEND_REQUEST', async () => {
    const { jwt, username } = await request.createAndSignIn(account1Credentials);
    const response = await request.sendFriendRequest(jwt, username);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('SELF_FRIEND_REQUEST');
  });

  it('should return 409 and FRIEND_EXISTS', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    await request.sendFriendRequest(account1.jwt, account2.username);
    await request.acceptFriendRequest(account2.jwt, account1.userId);

    const response = await request.sendFriendRequest(account1.jwt, account2.username);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('FRIEND_EXISTS');
  });
});

describe('PATCH api/users/me/friend-requests', () => {
  it('should return 200 and accept friend', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    await request.sendFriendRequest(account1.jwt, account2.username);
    const acceptRequestResponse = await request.acceptFriendRequest(account2.jwt, account1.userId);

    const userInfoResponse = await request.fetchUserInfo(account1.jwt);
    const friends = userInfoResponse?.body?.userInfo?.friends ?? null;
    const conversations = userInfoResponse?.body?.userInfo?.conversations ?? null;

    expect(acceptRequestResponse.status).toBe(200);
    expect(acceptRequestResponse.body.success).toBe(true);
    expect(friends.length).toBe(1);
    expect(friends[0]).toMatchObject({
      id: account2.userId,
    });
    expect(conversations.length).toBe(1);
    expect(conversations[0]).toMatchObject({
      members: [{ id: account1.userId }, { id: account2.userId }],
    });
  });

  it('should return 404 and FRIEND_REQUEST_NOT_FOUND', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    const response = await request.acceptFriendRequest(account1.jwt, account2.userId);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('FRIEND_REQUEST_NOT_FOUND');
  });
});

describe('DELETE api/users/me/friend-requests', () => {
  it('should return 200 and remove friend request (as outgoing)', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    await request.sendFriendRequest(account1.jwt, account2.username);
    const removeResponse = await request.removeFriendRequest(account1.jwt, account2.userId);

    const fetchResponse = await request.fetchFriendRequests(account1.jwt);

    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.success).toBe(true);
    expect(fetchResponse.body.friendRequests.length).toBe(0);
  });

  it('should return 200 and remove friend request (as incoming)', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    await request.sendFriendRequest(account1.jwt, account2.username);
    const removeResponse = await request.removeFriendRequest(account2.jwt, account1.userId);

    const fetchResponse = await request.fetchFriendRequests(account1.jwt);

    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.success).toBe(true);
    expect(fetchResponse.body.friendRequests.length).toBe(0);
  });

  it("should return 404 and FRIEND_REQUEST_NOT_FOUND'", async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    const removeResponse = await request.removeFriendRequest(account2.jwt, account1.userId);

    expect(removeResponse.status).toBe(404);
    expect(removeResponse.body.code).toBe('FRIEND_REQUEST_NOT_FOUND');
  });
});

describe('DELETE api/users/me/friends', () => {
  it('should return 200 and remove friend', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    await request.makeFriends(account1, account2);
    const response = await request.removeFriend(account1.jwt, account2.userId);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should return 404 and FRIEND_NOT_FOUND', async () => {
    const account1 = await request.createAndSignIn(account1Credentials);
    const account2 = await request.createAndSignIn(account2Credentials);

    const response = await request.removeFriend(account1.jwt, account2.userId);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('FRIEND_NOT_FOUND');
  });
});
