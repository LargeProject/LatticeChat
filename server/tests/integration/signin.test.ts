import { describe, it, expect, beforeEach } from 'vitest';
import { request, resetDatabase } from '../util';

beforeEach(async () => {
  await resetDatabase();
});

describe('POST /api/auth/sign-in/email', () => {
  describe('when input is valid', () => {
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
  });
});
