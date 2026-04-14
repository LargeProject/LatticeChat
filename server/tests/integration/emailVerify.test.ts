import { describe, it, expect, beforeEach } from 'vitest';
import { database, request, resetDatabase, wait } from '../util';

beforeEach(async () => {
  await resetDatabase();
});

describe('POST /api/auth/email-otp/send-verification-code', () => {
  it('should return 200 and success', async () => {
    await request.signUp({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const response = await request.sendEmailVerification({ email: 'test@gmail.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(await database.getOtp('test@gmail.com')).toBeDefined();
  });
});

describe('POST /api/auth/email-otp/verify-email', () => {
  describe('when input is valid', () => {
    it('should return 200 and success', async () => {
      await request.signUp({
        name: 'test',
        email: 'test@gmail.com',
        password: 'Test@Test.Test',
      });

      await request.sendEmailVerification({ email: 'test@gmail.com' });

      const response = await request.verifyEmail({
        email: 'test@gmail.com',
        otp: await database.getOtp('test@gmail.com'),
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: true,
        token: null,
        user: {
          name: 'test',
          email: 'test@gmail.com',
          emailVerified: true,
          friendIds: [],
          conversationIds: [],
        },
      });
    });
  });

  describe('when input is invalid', () => {
    it('should return 400 and INVALID_OTP', async () => {
      const response = await request.verifyEmail({
        email: 'test@gmail.com',
        otp: '000000',
      });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_OTP');
    });
  });
});
