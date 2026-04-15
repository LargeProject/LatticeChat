import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { connectDatabase, database, disconnectDatabase, resetDatabase } from '../integration/util/database';
import { ConversationService, UserService } from '../../src/db';
import { bufferToString } from './util';

beforeEach(async () => {
  await connectDatabase();
  await resetDatabase();
});

afterEach(async () => {
  await disconnectDatabase();
});

describe('UserServices - findUser', () => {
  it('should return user with given id', async () => {
    const user = await database.createFakeUser({ name: 'test', email: 'test@gmail.com' });
    const foundUser = await UserService.findUser(user.id);

    expect(foundUser.toObject()).toMatchObject(user.toObject());
  });
});

describe('UserServices - createFriendRequest & getFriendRequests', () => {
  it('should create friend request', async () => {
    const user1 = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const user2 = await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });

    const friendRequest = await UserService.createFriendRequest(user1.id, user2.id);
    const foundFriendRequests = await UserService.getFriendRequests(user1.id);

    expect(foundFriendRequests[0].toObject()).toMatchObject(friendRequest.toObject());
  });
});

describe('UserServices - acceptFriendRequest', () => {
  it('should accept friend request', async () => {
    let user1 = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    let user2 = await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });

    await UserService.createFriendRequest(user1.id, user2.id);
    await UserService.acceptFriendRequest(user1.id, user2.id);

    // update users
    user1 = await UserService.findUser(user1.id);
    user2 = await UserService.findUser(user2.id);

    const user1ConversationId = bufferToString(user1.conversationIds[0].id);
    const user2ConversationId = bufferToString(user2.conversationIds[0].id);
    const conversation = await ConversationService.findConversation(user1ConversationId);

    const user1Friend = bufferToString(user1.friendIds[0].id);
    const user2Friend = bufferToString(user2.friendIds[0].id);

    expect(user1Friend).toEqual(user2.id);
    expect(user2Friend).toEqual(user1.id);
    expect(user1ConversationId).toEqual(user2ConversationId);
    expect(conversation).toBeDefined();
  });
});

describe('UserServices - removeFriendRequest', () => {
  it('should remove friend request', async () => {
    const user1 = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const user2 = await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });

    await UserService.createFriendRequest(user1.id, user2.id);
    await UserService.removeFriendRequest(user1.id, user2.id);

    const foundFriendRequests = await UserService.getFriendRequests(user1.id);

    expect(foundFriendRequests.length).toBe(0);
  });
});

describe('UserServices - isUsername', () => {
  it('should return true', async () => {
    await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const isTaken = await UserService.isUsernameTaken('test1');

    expect(isTaken).toBe(true);
  });

  it('should return false', async () => {
    await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });
    const isTaken = await UserService.isUsernameTaken('test1');

    expect(isTaken).toBe(false);
  });
});

describe('UserServices - isEmailTaken', () => {
  it('should return true', async () => {
    await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const isTaken = await UserService.isEmailTaken('test1@gmail.com');

    expect(isTaken).toBe(true);
  });

  it('should return false', async () => {
    await database.createFakeUser({ name: 'test2', email: 'test2@gmail.com' });
    const isTaken = await UserService.isEmailTaken('test1@gmail.com');

    expect(isTaken).toBe(false);
  });
});

describe('UserServices - getBasicInfoById', () => {
  it('should return basic user info of created user', async () => {
    const user = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const foundUser = await UserService.getBasicUserInfoById(user.id);

    expect(foundUser).toMatchObject({
      id: user.id,
      name: user.name,
      createdAt: user.createdAt,
    });
  });
});

describe('UserServices - getBasicInfoByName', () => {
  it('should return basic user info of created user', async () => {
    const user = await database.createFakeUser({ name: 'test1', email: 'test1@gmail.com' });
    const foundUser = await UserService.getBasicUserInfoByName('test1');

    expect(foundUser).toMatchObject({
      id: user.id,
      name: user.name,
      createdAt: user.createdAt,
    });
  });
});
