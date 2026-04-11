import type { Server as HttpServer } from 'node:http';
import { Server as IOServer } from 'socket.io';
import { ENV } from '../../util/env';
import * as types from './types';
import { UserConnectionManager } from './UserConnectionManager';
import type { AckResponse } from '@latticechat/shared';

export type AckCallback = (response: AckResponse) => void;
export const ACK_SUCCESS = { success: true };
export const ACK_FAIL = { success: false };

export class WebsocketServer {
  private server: IOServer;
  private events: types.RegisteredEvent[] = [];
  private connectionManager: UserConnectionManager;

  constructor(httpServer: HttpServer) {
    this.server = new IOServer(httpServer, {
      cors: {
        origin: ENV.ALLOW_ORIGIN,
      },
    });
    this.connectionManager = new UserConnectionManager();
  }

  public registerEvent(event: types.RegisteredEvent): this {
    this.events.push(event);
    return this;
  }

  public registerEvents(events: types.RegisteredEvent[]): this {
    events.forEach((event) => this.registerEvent(event));
    return this;
  }

  public start(): this {
    this.server.on('connection', (socket: types.SocketWithAuth) => {
      this.setupDisconnect(socket);
      this.setupEventListeners(socket);
    });

    return this;
  }

  private setupDisconnect(socket: types.SocketWithAuth) {
    socket.on('disconnect', () => {
      this.connectionManager.disconnect(socket);
    });
  }

  private dispatch(socket: types.SocketWithAuth, event: types.RegisteredEvent) {
    socket.on(event.name, async (payload: any, ack?: AckCallback) => {
      if (!socket.data.userId && !event.isPublic) {
        console.log(socket.data);
        console.warn(
          `Event ${event.name} (${event.isPublic ? 'public' : 'protected'}) received from unauthenticated socket`,
        );
        ack?.(ACK_FAIL);
        return;
      }

      try {
        const parsed = await this.validatePayload(event.name, payload, event.payloadSchema);
        const context: types.WebsocketContext = {
          server: this.server,
          connectionManager: this.connectionManager,
          socket,
          userId: socket.data.userId,
        };
        const result = await event.handler(parsed, context);

        ack?.(result);
      } catch (error) {
        if (error instanceof types.WebsocketError) {
          console.error(`[${event.name}] ${error.code}: ${error.message}`);
        } else {
          console.error(`[${event.name}] Unexpected error:`, error);
        }
        ack?.(ACK_FAIL);
      }
    });
  }

  private async validatePayload(eventName: string, payload: any, schema: any): Promise<any> {
    const parsed = schema.safeParse(payload);
    if (parsed.error) {
      try {
        console.error(
          `[${eventName}] payload validation failed:`,
          parsed.error.format ? parsed.error.format() : parsed.error,
        );
      } catch (logErr) {
        console.error(`[${eventName}] payload validation failed (unable to format error)`, parsed.error);
      }
      throw new types.WebsocketError(
        `Invalid payload for ${eventName}: ${JSON.stringify(parsed.error.format ? parsed.error.format() : parsed.error)}`,
        'VALIDATION_ERROR',
        400,
      );
    }
    return parsed.data;
  }

  private setupEventListeners(socket: types.SocketWithAuth) {
    for (const event of this.events) {
      this.dispatch(socket, event);
    }
  }

  public getConnectionManager(): UserConnectionManager {
    return this.connectionManager;
  }

  public getIOServer(): IOServer {
    return this.server;
  }
}
