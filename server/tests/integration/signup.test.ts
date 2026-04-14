import { describe, it, expect, beforeEach } from 'vitest';
import { resetDatabase, request } from '../util';

beforeEach(async () => {
  await resetDatabase();
});

describe('POST /api/auth/sign-up/email', () => {
  describe('when input is valid', () => {
    it('should return 200 and user info', async () => {
      const response = await request.signUp({
        name: 'test',
        email: 'test@gmail.com',
        password: 'Test@Test.Test',
      });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body).toMatchObject({
        token: null,
        user: {
          name: 'test',
          email: 'test@gmail.com',
          emailVerified: false,
          friendIds: [],
          conversationIds: [],
        },
      });
    });
  });

  describe('when input is invalid', () => {
    it('should return 400 and USERNAME_TAKEN', async () => {
      await request.signUp({
        name: 'test',
        email: 'test@gmail.com',
        password: 'Test@Test.Test',
      });

      const response = await request.signUp({
        name: 'test',
        email: 'test2@gmail.com',
        password: 'Test@Test.Test',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('USERNAME_TAKEN');
    });

    it('should return 400 and EMAIL_TAKEN', async () => {
      await request.signUp({
        name: 'test',
        email: 'test@gmail.com',
        password: 'Test@Test.Test',
      });

      const response = await request.signUp({
        name: 'test2',
        email: 'test@gmail.com',
        password: 'Test@Test.Test',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('EMAIL_TAKEN');
    });

    it('should return 400 and INVALID_PASSWORD', async () => {
      const response = await request.signUp({
        name: 'test',
        email: 'test@gmail.com',
        password: '1234',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_PASSWORD');
    });
  });
});
