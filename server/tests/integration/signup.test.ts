import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import { server } from '../../src/server';
import mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connection.dropDatabase();
});

async function signUp(credentials: {name: string, email: string, password: string}) {
  return await request(server).post('/api/auth/sign-up/email').send(credentials);
}

describe('POST /api/auth/sign-up/email', () => {

  describe('when input is valid', () => {

    // test normal sign up
    it('should return 200 and ok', async () => {
      const response = await signUp({
        name: 'test',
        email: 'test@gmail.com',
        password: '1jBzQ3B&0&&$',
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
  })

  describe('when input is invalid', () => {
    // test sign up with taken username
    it('should return 400 and USERNAME_TAKEN', async () => {
      await signUp({
        name: 'test',
        email: 'test@gmail.com',
        password: '1jBzQ3B&0&&$',
      });

      const response = await signUp({
        name: 'test',
        email: 'test2@gmail.com',
        password: '1jBzQ3B&0&&$',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 'USERNAME_TAKEN',
      });
    });

    // test signup with taken email
    it('should return 400 and EMAIL_TAKEN', async () => {
      await signUp({
        name: 'test',
        email: 'test@gmail.com',
        password: '1jBzQ3B&0&&$',
      });

      const response = await signUp({
        name: 'test2',
        email: 'test@gmail.com',
        password: '1jBzQ3B&0&&$',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 'EMAIL_TAKEN',
      });
    });

    // test signup with weak password
    it('should return 400 and INVALID_PASSWORD', async () => {
      const response = await signUp({
        name: 'test',
        email: 'test@gmail.com',
        password: '1234',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        code: 'INVALID_PASSWORD',
      });
    });
  });

});
