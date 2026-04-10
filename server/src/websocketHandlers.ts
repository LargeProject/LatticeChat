import { MessageService } from './services/websocketService';
import type { WebsocketContext } from './lib/websocket/types';

export async function handleCreateMessage(data: any, context: WebsocketContext) {
  return MessageService.handleCreateMessage(data, context);
}
