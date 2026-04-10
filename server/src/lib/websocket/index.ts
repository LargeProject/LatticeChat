import type { Server as HttpServer } from 'node:http';
import { Server as IOServer } from 'socket.io';
import { ENV } from '../../util/env';
import type { RegisteredEvent, SocketWithAuth } from './types';
import { UserConnectionManager } from './UserConnectionManager';
import { EventDispatcher } from './EventDispatcher';
import * as z from 'zod';

export class WebsocketServer {
  private server: IOServer;
  private events: RegisteredEvent[] = [];
  private connectionManager: UserConnectionManager;
  private eventDispatcher: EventDispatcher;

  constructor(httpServer: HttpServer) {
    this.server = new IOServer(httpServer, {
      cors: {
        origin: ENV.ALLOW_ORIGIN,
      },
    });
    this.connectionManager = new UserConnectionManager();
    this.eventDispatcher = new EventDispatcher();
  }

  public registerEvent(event: RegisteredEvent): this {
    this.events.push(event);
    return this;
  }

  public registerEvents(events: RegisteredEvent[]): this {
    events.forEach((event) => this.registerEvent(event));
    return this;
  }

  public start(): this {
    this.server.on('connection', (socket: SocketWithAuth) => {
      this.setupAuthHandshake(socket);
      this.setupDisconnect(socket);
      this.setupEventListeners(socket);
    });

    return this;
  }

  private setupAuthHandshake(socket: SocketWithAuth) {
    socket.on('initHandshake', async (data: any, ack?: (response: any) => void) => {
      try {
        const initHandshakeEvent = this.events.find((e) => e.name === 'initHandshake');
        if (!initHandshakeEvent) {
          ack?.({ success: false, error: 'Auth handler not configured' });
          socket.disconnect(true);
          return;
        }

        const parsed = initHandshakeEvent.payloadSchema.safeParse(data);
        if (parsed.error) {
          console.error('Handshake validation failed:', z.prettifyError(parsed.error));
          ack?.({ success: false, error: 'Invalid handshake payload' });
          socket.disconnect(true);
          return;
        }

        const result = await initHandshakeEvent.handler(parsed.data, {
          server: this.server,
          socket,
          userId: 'system',
        });

        if (result && typeof result === 'string') {
          socket.data.userId = result;
          this.connectionManager.addSocket(result, socket.id);
          try {
            socket.join(result);
          } catch (e) {
            console.error('Failed to join user room', e);
          }
          ack?.({ success: true, userId: result });
          console.log(`User ${result} authenticated (socket: ${socket.id}) and joined room ${result}`);
        } else {
          ack?.({ success: false, error: 'Authentication failed' });
          socket.disconnect(true);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Handshake error:', errorMessage);
        ack?.({ success: false, error: errorMessage });
        socket.disconnect(true);
      }
    });
  }

  private setupDisconnect(socket: SocketWithAuth) {
    socket.on('disconnect', () => {
      this.connectionManager.disconnect(socket);
    });
  }

  private setupEventListeners(socket: SocketWithAuth) {
    // Skip auth and disconnect events
    const eventNames = this.events
      .filter((e) => e.name !== 'initHandshake')
      .map((e) => e.name);

    for (const eventName of eventNames) {
      const event = this.events.find((e) => e.name === eventName);
      if (!event) continue;

      this.eventDispatcher.dispatch(
        socket,
        eventName,
        async (context, payload) => {
          const parsed = await this.eventDispatcher.emitWithValidation(
            socket,
            eventName,
            payload,
            event.payloadSchema
          );
          return event.handler(parsed, context);
        },
        this.server
      );
    }
  }

  public getConnectionManager(): UserConnectionManager {
    return this.connectionManager;
  }

  public getIOServer(): IOServer {
    return this.server;
  }
}
