import * as handlers from './db';
import type { EventType } from './lib/websockets';
import * as payload from '@latticechat/shared';
import { validateWSHandshake } from './util/ws';

export const events: EventType[] = [
  {
    name: 'initHandshake',
    payloadSchema: payload.initHandshake,
    handler: validateWSHandshake,
  },
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
