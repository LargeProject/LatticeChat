import type { Socket, Server as SocketIOServer } from 'socket.io';
import type * as z from 'zod';
import type { UserConnectionManager } from './UserConnectionManager';
import type { AckCallback } from '.';
import type { AckResponse } from '@latticechat/shared';

export type SocketWithAuth = Socket & { data: { userId?: string } };

export interface WebsocketContext {
  server: SocketIOServer;
  socket: SocketWithAuth;
  connectionManager: UserConnectionManager;
  userId: string;
}

export interface EventHandler {
  (payload: any, context: WebsocketContext): Promise<AckResponse> | AckResponse;
}

export interface RegisteredEvent {
  name: string;
  payloadSchema: z.ZodType;
  handler: EventHandler;
  isPublic: boolean;
}

export class WebsocketError extends Error {
  constructor(
    message: string,
    public code: string = 'WEBSOCKET_ERROR',
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'WebsocketError';
  }
}
