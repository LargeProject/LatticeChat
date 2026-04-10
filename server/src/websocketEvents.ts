import { WebsocketHandlers } from './websocket/handlers';
import type { RegisteredEvent } from './lib/websocket/types';
import * as payload from '@latticechat/shared';
import { validateWSHandshake } from './util/ws';

export const events: RegisteredEvent[] = [
  {
    name: 'initHandshake',
    payloadSchema: payload.initHandshake,
    handler: validateWSHandshake,
  },
  {
    name: 'createMessage',
    payloadSchema: payload.createMessage,
    handler: WebsocketHandlers.handleCreateMessage,
  },
  {
    name: 'createConversation',
    payloadSchema: payload.createConversation,
    handler: WebsocketHandlers.handleCreateConversation,
  },
  {
    name: 'addMember',
    payloadSchema: payload.addMember,
    handler: WebsocketHandlers.handleAddMember,
  },
];
