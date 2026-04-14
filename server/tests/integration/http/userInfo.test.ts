import { describe, it, expect, beforeEach } from 'vitest';
import { request } from '../util/http';
import { resetDatabase } from '../util/database';

beforeEach(async () => {
  await resetDatabase();
});

describe('GET /api/users/me', () => {
  it('should return 200 and user info', async () => {
    const { jwt } = await request.createAndSignIn({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const response = await request.fetchUserInfo(jwt);

    expect(response.status).toBe(200);
    expect(response.body.userInfo).toMatchObject({
      user: {
        name: 'test',
        email: 'test@gmail.com',
      },
      conversations: [],
      friends: [],
    });
  });
});

describe('GET api/users/:user_id', () => {
  it('should return 200 and basic user info', async () => {
    const { userId } = await request.createAndSignIn({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const response = await request.fetchBasicUserInfo(userId);

    expect(response.status).toBe(200);
    expect(response.body.basicUserInfo).toMatchObject({
      name: 'test',
    });
  });

  it('should return 401 and INVALID_TOKEN', async () => {
    const response = await request.fetchUserInfo('I-am-a-very-valid-jwt-please-accept-me-please');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_TOKEN');
  });

  it('should return 404 and USER_NOT_FOUND', async () => {
    const invalidUserId = '69dd90e1da7c1c0bf396791b';
    const response = await request.fetchBasicUserInfo(invalidUserId);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('USER_NOT_FOUND');
  });
});
