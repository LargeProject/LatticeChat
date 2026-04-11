import { WebsocketHandlers } from './handlers';
import type { RegisteredEvent } from '../lib/websocket/types';
import * as payload from '@latticechat/shared';

export const events: RegisteredEvent[] = [
  {
    name: 'initHandshake',
    payloadSchema: payload.initHandshake,
    handler: WebsocketHandlers.initHandshake,
    isPublic: true,
  },
  {
    name: 'createMessage',
    payloadSchema: payload.createMessage,
    handler: WebsocketHandlers.handleCreateMessage,
    isPublic: false,
  },
  {
    name: 'createConversation',
    payloadSchema: payload.createConversation,
    handler: WebsocketHandlers.handleCreateConversation,
    isPublic: false,
  },
  {
    name: 'addMember',
    payloadSchema: payload.addMember,
    handler: WebsocketHandlers.handleAddMember,
    isPublic: false,
  },
];
