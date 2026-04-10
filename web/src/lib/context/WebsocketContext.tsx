import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';

export type WebsocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'error';

export type WebsocketContextType = {
  socket: Socket | null;
  connectionState: WebsocketConnectionState;
  error: string | null;
  userId: string | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  emit: (event: string, data?: any) => void;
  emitWithAck: <R = any>(event: string, data?: any, timeoutMs?: number) => Promise<R>;
};

export const WebsocketContext = createContext<WebsocketContextType | undefined>(undefined);

export const useWebsocketContext = () => {
  const context = useContext(WebsocketContext);
  if (!context) {
    throw new Error('useWebsocketContext must be used within a WebsocketProvider');
  }
  return context;
};
