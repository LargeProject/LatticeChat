import supertest, { Response } from 'supertest';
import { server } from '../../../src/server';
import { User } from '../../../src/db/models';

export type AccountInfo = {
  username: string;
  userId: string;
  jwt: string;
};

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

    const userId = response.body.user.id;
    const username = response.body.user.name;
    const jwt = response.headers['set-auth-token'];
    const account: AccountInfo = { jwt, userId, username };

    return account;
  }

  async sendPasswordResetVerification(body: { email: string }) {
    return await supertest(server)
      .post('/api/auth/email-otp/send-verification-otp')
      .send({ ...body, type: 'forget-password' });
  }

  async verifyPasswordReset(body: { email: string; otp: string; password: string }) {
    return await supertest(server).post('/api/auth/email-otp/reset-password').send(body);
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

  async deleteUser(jwt: string) {
    return await supertest(server)
      .delete('/api/users/me')
      .set('Authorization', 'Bearer ' + jwt)
      .send();
  }

  async fetchFriendRequests(jwt: string) {
    return await supertest(server)
      .get('/api/users/me/friend-requests')
      .set('Authorization', 'Bearer ' + jwt)
      .send();
  }

  async sendFriendRequest(jwt: string, targetId: string) {
    return await supertest(server)
      .post('/api/users/me/friend-requests')
      .set('Authorization', 'Bearer ' + jwt)
      .send({ targetId: targetId });
  }

  async acceptFriendRequest(jwt: string, targetId: string) {
    return await supertest(server)
      .patch('/api/users/me/friend-requests')
      .set('Authorization', 'Bearer ' + jwt)
      .send({ targetId: targetId });
  }

  async removeFriendRequest(jwt: string, targetId: string) {
    return await supertest(server)
      .delete('/api/users/me/friend-requests')
      .set('Authorization', 'Bearer ' + jwt)
      .send({ targetId: targetId });
  }

  async removeFriend(jwt: string, targetId: string) {
    return await supertest(server)
      .delete('/api/users/me/friends')
      .set('Authorization', 'Bearer ' + jwt)
      .send({ targetId: targetId });
  }

  async searchConversation(jwt: string, search: string) {
    return await supertest(server)
      .get('/api/users/me/conversations?search=' + search)
      .set('Authorization', 'Bearer ' + jwt)
      .send();
  }

  async fetchConversationMessages(jwt: string, conversationId: string) {
    return await supertest(server)
      .get('/api/users/me/conversations/' + conversationId + '/messages')
      .set('Authorization', 'Bearer ' + jwt)
      .send();
  }

  async makeFriends(account1: AccountInfo, account2: AccountInfo) {
    await request.sendFriendRequest(account1.jwt, account2.userId);
    await request.acceptFriendRequest(account2.jwt, account1.userId);
  }
}

export const request = new Request();
