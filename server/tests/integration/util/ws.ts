import { WebsocketServer } from '../../../src/lib/websocket';
import { server } from '../../../src/server';
import { events } from '../../../src/websocket/clientEvents';
import { io, Socket } from 'socket.io-client';
import { ENV } from '../../../src/util/env';
import { CreateConversation, InitHandshake } from '@latticechat/shared';
import { AccountInfo } from './http';

const socketPort = (parseInt(ENV.PORT) + 1).toString();
const clientUrl = 'http://localhost:' + socketPort;

class ClientEnvironmentContainer {
  private clients: TestClient[] = [];

  public createClient() {
    const testClient = new TestClient();
    this.clients.push(testClient);
    return testClient;
  }

  public destroy() {
    for (const client of this.clients) {
      client.close();
    }
    this.clients = [];
  }
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

  public on(eventName: string, callback: (data: any) => void) {
    this.baseClient.on(eventName, callback);
  }

  public async emit(eventName: string, data: any) {
    return await this.baseClient.emitWithAck(eventName, data);
  }

  public async emitHandShake(handShakePayload: InitHandshake) {
    return await this.emit('initHandshake', handShakePayload);
  }

  public async emitCreateConversation(accounts: AccountInfo[]) {
    const createConversationPayload: CreateConversation = {
      memberIds: accounts.map((account) => account.userId),
    };
    return await this.emit('createConversation', createConversationPayload);
  }
}

let socketServer: WebsocketServer | null;
export let environment: ClientEnvironmentContainer = new ClientEnvironmentContainer();

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
}

export async function destroySocketEnvironment() {
  await socketServer.stop();
  environment.destroy();
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
