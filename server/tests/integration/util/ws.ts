import { WebsocketServer } from '../../../src/lib/websocket';
import { server } from '../../../src/server';
import { events } from '../../../src/websocket/clientEvents';
import { io, Socket } from 'socket.io-client';
import { ENV } from '../../../src/util/env';

let socketServer: WebsocketServer | null;
export let client: TestClient;

const socketPort = (parseInt(ENV.PORT) + 1).toString();
const clientUrl = 'http://localhost:' + socketPort;

export async function startSocketServer() {
  const io = new WebsocketServer(server).registerEvents(events).start();
  socketServer = await new Promise((resolve, reject) => {
    server.listen(socketPort, () => {
      resolve(io);
    });

    server.once('error', (error) => {
      reject(error);
    });
  });
}

export async function initSocketEnvironment() {
  await startSocketServer();
  client.reset();
}

export async function destroySocketEnvironment() {
  await socketServer.stop();
  client.close();
}

class TestClient {
  private baseClient: Socket;

  constructor() {
    this.reset();
  }

  public reset() {
    this.baseClient = io(clientUrl);
  }

  public close() {
    this.baseClient.close();
  }

  public on(eventName: string, callback: (data: any) => {}) {
    this.baseClient.on(eventName, callback);
  }

  public async emit(eventName: string, data: any) {
    return new Promise<any>((resolve, reject) => {
      this.baseClient.emit(eventName, data, (res: any) => {
        resolve(res);
      });
    });
  }
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
