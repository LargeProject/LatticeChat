import { describe, it, expect, beforeEach } from 'vitest';
import { request } from '../util/http';
import { resetDatabase } from '../util/database';

beforeEach(async () => {
  await resetDatabase();
});

describe('POST /api/auth/change-password', () => {
  it('should return 200 and change password', async () => {
    const { jwt, userId } = await request.createAndSignIn({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const changePasswordResponse = await request.sendChangePassword(jwt, {
      currentPassword: 'Test@Test.Test',
      newPassword: 'Test@Test.Test@Test',
    });

    const signInResponse = await request.signIn({
      email: 'test@gmail.com',
      password: 'Test@Test.Test@Test',
    });

    expect(changePasswordResponse.status).toBe(200);
    expect(changePasswordResponse.body).toMatchObject({
      user: {
        name: 'test',
        email: 'test@gmail.com',
        emailVerified: true,
        friendIds: [],
        conversationIds: [],
        id: userId,
      },
    });
    expect(signInResponse.status).toBe(200);
  });

  // current password incorrect
  it('should return 400 and INVALID_PASSWORD', async () => {
    const { jwt } = await request.createAndSignIn({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const response = await request.sendChangePassword(jwt, {
      currentPassword: 'Test@Test.Test@Test1',
      newPassword: 'Test@Test.Test@Test',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_PASSWORD');
  });

  // invalid password format when changing password
  it('should return 400 and INVALID_PASSWORD', async () => {
    const { jwt } = await request.createAndSignIn({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const response = await request.sendChangePassword(jwt, {
      currentPassword: 'Test@Test.Test@Test',
      newPassword: '1234',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_PASSWORD');
  });
});
