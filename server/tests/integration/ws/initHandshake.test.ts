import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { request } from '../util/http';
import { InitHandshake } from '@latticechat/shared';
import { resetDatabase } from '../util/database';
import { client, destroySocketEnvironment, initSocketEnvironment } from '../util/ws';

beforeEach(async () => {
  await resetDatabase();
  await initSocketEnvironment();
});

afterEach(async () => {
  await destroySocketEnvironment();
});

describe('socket io init hand shake', () => {
  it('should return success', async () => {
    const { jwt, userId } = await request.createAndSignIn({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const handShakePayload: InitHandshake = { jwt: jwt, id: userId };

    const response = await client.emit('initHandshake', handShakePayload);

    expect(response.success).toBe(true);
  });

  it('should return error', async () => {
    const handShakePayload: InitHandshake = { jwt: '0', id: '0' };

    const response = await client.emit('initHandshake', handShakePayload);

    expect(response.success).toBe(false);
  });
});
