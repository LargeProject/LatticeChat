import type { Server as HttpServer } from 'node:http';
import { Server as IOServer } from 'socket.io';
import { ENV } from '../util/env';
import { sendMessage, SendMessage } from '@latticechat/shared';
import * as z from 'zod';

const createIO = (server: HttpServer) => {
  const io = new IOServer(server, {
    cors: {
      origin: ENV.ALLOW_ORIGIN,
    },
  });

  io.on('connection', (socket) => {
    socket.on(
      'createMessage',
      (_data: SendMessage, ack: (response: any) => {}) => {
        const parsed = sendMessage.safeParse(_data);

        if (parsed.error) {
          console.error(
            'Error parsing createMessage payload',
            z.prettifyError(parsed.error),
          );
          return ack(false);
        }

        console.log('create message:', parsed);

        ack(true);
      },
    );

    console.log('Client connected!');
  });

  return io;
};

export { createIO };
