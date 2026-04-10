import type { Server } from 'socket.io';
import type { SocketWithAuth, WebsocketContext } from './types';
import { WebsocketError } from './types';

export class EventDispatcher {
  dispatch(
    socket: SocketWithAuth,
    eventName: string,
    handler: (context: WebsocketContext, payload: any) => Promise<any> | any,
    server: Server
  ) {
    socket.on(eventName, async (payload: any, ack?: (response: any) => void) => {
      if (!socket.data.userId) {
        console.warn(`Event ${eventName} received from unauthenticated socket`);
        ack?.(null, { success: false });
        return;
      }

      try {
        const context: WebsocketContext = {
          server,
          socket,
          userId: socket.data.userId,
        };
        const result = await handler(context, payload);
        ack?.(null, { success: result !== false ? true : false });
      } catch (error) {
        if (error instanceof WebsocketError) {
          console.error(`[${eventName}] ${error.code}: ${error.message}`);
        } else {
          console.error(`[${eventName}] Unexpected error:`, error);
        }
        ack?.(null, { success: false });
      }
    });
  }

  async emitWithValidation(
    socket: SocketWithAuth,
    eventName: string,
    payload: any,
    schema: any
  ): Promise<any> {
    const parsed = schema.safeParse(payload);
    if (parsed.error) {
      try {
        console.error(`[${eventName}] payload validation failed:`, parsed.error.format ? parsed.error.format() : parsed.error);
      } catch (logErr) {
        console.error(`[${eventName}] payload validation failed (unable to format error)`, parsed.error);
      }
      throw new WebsocketError(
        `Invalid payload for ${eventName}: ${JSON.stringify(parsed.error.format ? parsed.error.format() : parsed.error)}`,
        'VALIDATION_ERROR',
        400
      );
    }
    return parsed.data;
  }
}
