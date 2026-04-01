import type { Server as HttpServer } from 'node:http';
import { Server as IOServer } from 'socket.io';
import { ENV } from '../util/env';
import * as z from 'zod';

export type EventType = {
  name: string;
  payloadSchema: z.ZodType;
  handler: (payload: any) => any;
};

export class WebsocketServer {
  private server: IOServer;
  private events: EventType[];

  constructor(server: HttpServer) {
    this.server = new IOServer(server, {
      cors: {
        origin: ENV.ALLOW_ORIGIN,
      },
    });
    this.events = [];

    return this;
  }

  public addEvent(options: EventType) {
    this.events.push({
      ...options,
    });

    return this;
  }

  public addEvents(events: EventType[]) {
    for (const event of events) {
      this.addEvent(event);
    }

    return this;
  }

  public start() {
    this.server.on('connection', (socket) => {
      for (const event of this.events) {
        socket.on(
          event.name,
          async (
            _data: z.infer<typeof event.payloadSchema>,
            ack: (response: any) => {},
          ) => {
            const parsed = event.payloadSchema.safeParse(_data);

            if (parsed.error) {
              console.error(
                `Error parsing ${event.name} payload`,
                z.prettifyError(parsed.error),
              );
              return ack(false);
            }

            try {
              event.handler(parsed.data);
            } catch (e) {
              console.error(`Error handling ${event.name}`, e);
              return ack(false);
            }

            ack(true);
          },
        );
      }
    });

    return this;
  }
}
