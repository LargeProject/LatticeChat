import { describe, it, expect, beforeEach } from 'vitest';
import { request } from '../util/http';
import { resetDatabase } from '../util/database';

beforeEach(async () => {
  await resetDatabase();
});

describe('POST /api/auth/sign-in/email', () => {
  it('should return 200, user info, and jwt', async () => {
    await request.signUpVerified({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const response = await request.signIn({
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      redirect: false,
      user: {
        name: 'test',
        email: 'test@gmail.com',
        emailVerified: true,
        friendIds: [],
        conversationIds: [],
      },
    });
    expect(response.headers['set-auth-token']).toBeDefined();
  });

  it('should return 401 and INVALID_EMAIL_OR_PASSWORD', async () => {
    const response = await request.signIn({
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_EMAIL_OR_PASSWORD');
  });

  it('should return 403 and EMAIL_NOT_VERIFIED', async () => {
    await request.signUp({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const response = await request.signIn({
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('EMAIL_NOT_VERIFIED');
  });
});
