import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { request } from '../util/http';
import { resetDatabase } from '../util/database';
import { destroySocketEnvironment, environment, initSocketEnvironment } from '../util/ws';

beforeEach(async () => {
  await resetDatabase();
  await initSocketEnvironment();
});

afterEach(async () => {
  await destroySocketEnvironment();
});

const credentials = {
  name: 'test',
  email: 'test@gmail.com',
  password: 'Test@Test.Test',
};

describe('socket io init hand shake', () => {
  it('should return success', async () => {
    const client = environment.createClient();
    const { jwt, userId } = await request.createAndSignIn(credentials);

    const response = await client.emitHandShake({ jwt: jwt, id: userId });

    expect(response.success).toBe(true);
  });

  it('should return error', async () => {
    const client = environment.createClient();
    const response = await client.emitHandShake({ jwt: '0', id: '0' });

    expect(response.success).toBe(false);
  });
});
