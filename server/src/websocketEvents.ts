import { MessageService } from './services/websocketService';
import { handleCreateMessage } from './websocketHandlers';
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
    handler: handleCreateMessage,
  },
  {
    name: 'createConversation',
    payloadSchema: payload.createConversation,
    handler: async (data, context) => MessageService.handleCreateConversation(data, context),
  },
  {
    name: 'addMember',
    payloadSchema: payload.addMember,
    handler: async (data, context) => MessageService.handleAddMember(data, context),
  },
];
