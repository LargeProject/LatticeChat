import { WebsocketServer } from '../../../src/lib/websocket';
import { server } from '../../../src/server';
import { events } from '../../../src/websocket/clientEvents';
import { io, Socket } from 'socket.io-client';
import { ENV } from '../../../src/util/env';

const socketPort = (parseInt(ENV.PORT) + 1).toString();
const clientUrl = 'http://localhost:' + socketPort;

export async function startSocketServer() {
  const io = new WebsocketServer(server).registerEvents(events).start();
  return new Promise((resolve, reject) => {
    server.listen(socketPort, () => {
      resolve(io);
    });

    server.once('error', (error) => {
      reject(error);
    });
  });
}

export function createClientConnection(onConnection: () => void = () => {}) {
  const client = io(clientUrl);
  client.on('connect', onConnection);
  return io(clientUrl);
}

export function createWaitHook() {
  let isDone = false;
  let storedValue: any;
  let resolveFn: (value: any) => void;

  const promise = new Promise<any>((resolve) => {
    if (isDone) {
      resolve(storedValue);
    } else {
      resolveFn = resolve;
    }
  });

  const done = (value: any) => {
    if (isDone) return;
    isDone = true;
    storedValue = value;
    resolveFn?.(value);
  };

  return {
    done,
    waitUntilDone: () => promise,
  };
}

export async function waitForEvent(ws: Socket, event: string) {
  return new Promise((resolve) => {
    ws.on(event, resolve);
  });
}
