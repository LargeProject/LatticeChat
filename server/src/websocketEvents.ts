import * as handlers from './db';
import { EventType } from './lib/websockets';
import * as payload from '@latticechat/shared';

export const events: EventType[] = [
  {
    name: 'createMessage',
    payloadSchema: payload.createMessage,
    handler: handlers.createMessage,
  },
  {
    name: 'createConversation',
    payloadSchema: payload.createConversation,
    handler: handlers.createConversation,
  },
];
