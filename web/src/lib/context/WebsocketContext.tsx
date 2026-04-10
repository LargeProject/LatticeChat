import { createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';
import type * as contracts from '@latticechat/shared';

export type WebsocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'error';

type ClientEventMap = {
  initHandshake: contracts.InitHandshake;
  createMessage: contracts.CreateMessage;
  createConversation: contracts.CreateConversation;
  removePrivateConversation: contracts.RemovePrivateConversation;
  addMember: contracts.AddMember;
};

type ServerEventMap = {
  newMessage: contracts.EmitMessage;
  newConversation: any;
  newMember: contracts.EmitMemberAdded;
};

type AckResponse = contracts.AckResponse;

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
  ) => Promise<AckResponse>;
};

export const WebsocketContext = createContext<WebsocketContextType | undefined>(undefined);

export const useWebsocketContext = () => {
  const context = useContext(WebsocketContext);
  if (!context) throw new Error('useWebsocketContext must be used within a WebsocketProvider');

  return context;
};
