import type { Socket, Server as SocketIOServer } from 'socket.io';
import type * as z from 'zod';

export type SocketWithAuth = Socket & { data: { userId?: string } };

export interface WebsocketContext {
  server: SocketIOServer;
  socket: SocketWithAuth;
  userId: string;
}

export interface EventHandler {
  (payload: any, context: WebsocketContext): Promise<any> | any;
}

export interface RegisteredEvent {
  name: string;
  payloadSchema: z.ZodType;
  handler: EventHandler;
}

export class WebsocketError extends Error {
  constructor(
    message: string,
    public code: string = 'WEBSOCKET_ERROR',
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'WebsocketError';
  }
}
