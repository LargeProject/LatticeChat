import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { request } from '../util/http';
import { InitHandshake } from '@latticechat/shared';
import { resetDatabase } from '../util/database';
import { createClientConnection, createWaitHook, startSocketServer } from '../util/ws';

let server;

beforeEach(async () => {
  await resetDatabase();
  server = await startSocketServer();
});

afterEach(() => {
  server.stop();
});

describe('socket io init hand shake', () => {
  it('should return success', async () => {
    const { done, waitUntilDone } = createWaitHook();

    // create account
    const { jwt, userId } = await request.createAndSignIn({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const handShakePayload: InitHandshake = {
      jwt: jwt,
      id: userId,
    };

    // connect client to server
    const client = createClientConnection();
    client.emit('initHandshake', handShakePayload, (res) => {
      done(res);
    });

    const response = await waitUntilDone();
    expect(response.success).toBe(true);
  });

  it('should return error', async () => {
    const { done, waitUntilDone } = createWaitHook();

    const handShakePayload: InitHandshake = {
      jwt: '0',
      id: '0',
    };

    // connect client to server
    const client = createClientConnection();
    client.emit('initHandshake', handShakePayload, (res) => {
      done(res);
    });

    const response = await waitUntilDone();
    expect(response.success).toBe(false);
  });
});
