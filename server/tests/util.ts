import mongoose from 'mongoose';
import supertest from 'supertest';
import { server } from '../src/server';
import { User, Verification } from '../src/db/models';
import { Response } from 'supertest';

export async function resetDatabase() {
  await mongoose.connection.dropDatabase();

  await mongoose.connection.db?.createCollection('accounts');
  await mongoose.connection.db?.createCollection('conversations');
  await mongoose.connection.db?.createCollection('friendrequests');
  await mongoose.connection.db?.createCollection('messages');
  await mongoose.connection.db?.createCollection('session');
  await mongoose.connection.db?.createCollection('users');
  await mongoose.connection.db?.createCollection('verification');
}

export async function wait(time: number) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

class Request {
  async signIn(credentials: { email: string; password: string }) {
    return await supertest(server).post('/api/auth/sign-in/email').send(credentials);
  }

  async signUp(credentials: { name: string; email: string; password: string }) {
    return await supertest(server).post('/api/auth/sign-up/email').send(credentials);
  }

  async signUpVerified(credentials: { name: string; email: string; password: string }) {
    await supertest(server).post('/api/auth/sign-up/email').send(credentials);
    const user = await User.findOne({ email: credentials.email });
    user.emailVerified = true;
    await user.save();
  }

  async createAndSignIn(credentials: { name: string; email: string; password: string }) {
    await this.signUpVerified(credentials);
    const response: Response = await this.signIn(credentials);
    return response;
  }

  async sendEmailVerification(body: { email: string }) {
    return await supertest(server)
      .post('/api/auth/email-otp/send-verification-otp')
      .send({ ...body, type: 'email-verification' });
  }

  async verifyEmail(body: { email: string; otp: string }) {
    return await supertest(server).post('/api/auth/email-otp/verify-email').send(body);
  }

  async fetchUserInfo(jwt: string) {
    return await supertest(server)
      .get('/api/users/me')
      .set('Authorization', 'Bearer ' + jwt)
      .send();
  }

  async fetchBasicUserInfo(userId: string) {
    return await supertest(server)
      .get('/api/users/' + userId)
      .send();
  }
}

class Database {
  async getOtp(email: string): Promise<string | null> {
    const verification = await Verification.findOne({
      identifier: { $regex: email, $options: 'i' },
    });

    return verification?.value.replace(':0', '') ?? null;
  }
}

export const request = new Request();
export const database = new Database();
