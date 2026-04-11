import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';
import type * as contracts from '@latticechat/shared';
import type { ClientEventMap, ServerEventMap } from './WebsocketProvider';

export type WebsocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'error';

export type WebsocketContextType = {
  socket: Socket | null;
  connectionState: WebsocketConnectionState;
  error: string | null;
  userId: string | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  emit: <K extends keyof ServerEventMap>(event: K, data: ServerEventMap[K]) => void;
  emitWithAck: <K extends keyof ClientEventMap>(
    event: K,
    data: ClientEventMap[K],
    timeoutMs?: number,
  ) => Promise<contracts.AckResponse>;
};

export const WebsocketContext = createContext<WebsocketContextType | undefined>(undefined);

export const useWebsocketContext = () => {
  const context = useContext(WebsocketContext);
  if (!context) throw new Error('useWebsocketContext must be used within a WebsocketProvider');

  return context;
};
