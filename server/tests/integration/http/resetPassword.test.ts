import { describe, it, expect, beforeEach } from 'vitest';
import { request } from '../util/http';
import { database, resetDatabase } from '../util/database';

beforeEach(async () => {
  await resetDatabase();
});

describe('POST /api/auth/email-otp/send-verification-otp', () => {
  it('should return 200 and success', async () => {
    await request.signUp({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const response = await request.sendPasswordResetVerification({ email: 'test@gmail.com' });
    const otp = await database.getOtp('test@gmail.com');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(otp).toBeDefined();
  });
});

describe('POST /api/auth/email-otp/reset-password', () => {
  it('should return 200 and sign in info', async () => {
    await request.signUpVerified({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    // send password reset code
    await request.sendPasswordResetVerification({ email: 'test@gmail.com' });
    const otp = await database.getOtp('test@gmail.com');

    // reset password with code
    const verifyResponse = await request.verifyPasswordReset({
      email: 'test@gmail.com',
      otp: otp,
      password: 'Test@Test.Test@Test',
    });

    // sign in with new password
    const signInResponse = await request.signIn({
      email: 'test@gmail.com',
      password: 'Test@Test.Test@Test',
    });

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.success).toBe(true);

    expect(signInResponse.status).toBe(200);
    expect(signInResponse.body).toMatchObject({
      user: {
        name: 'test',
        email: 'test@gmail.com',
      },
    });
  });

  it('should return 400 and INVALID_PASSWORD', async () => {
    await request.signUpVerified({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    await request.sendPasswordResetVerification({ email: 'test@gmail.com' });
    const otp = await database.getOtp('test@gmail.com');

    const response = await request.verifyPasswordReset({
      email: 'test@gmail.com',
      otp: otp,
      password: '1234',
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('INVALID_PASSWORD');
  });
});
