import { MessageHandlers } from './websocket/MessageService';
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
    handler: MessageHandlers.handleCreateMessage,
  },
  {
    name: 'createConversation',
    payloadSchema: payload.createConversation,
    handler: MessageHandlers.handleCreateConversation,
  },
  {
    name: 'addMember',
    payloadSchema: payload.addMember,
    handler: MessageHandlers.handleAddMember,
  },
];
