import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { WebsocketContext } from './WebsocketContext';
import type { WebsocketConnectionState, WebsocketContextType } from './WebsocketContext';
import { getLocalJWT, getLocalUserId, setLocalUserId } from '#/lib/util/storage';
import { fetchUserInfo } from '#/lib/api/user';
import type * as contracts from '@latticechat/shared';

interface WebsocketProviderProps {
  children: ReactNode;
  wsUrl: string;
  onError?: (error: string) => void;
}

/**
 * Events client can emit
 */
export type ClientEventMap = {
  initHandshake: contracts.InitHandshake;
  createMessage: contracts.CreateMessage;
  createConversation: contracts.CreateConversation;
  removePrivateConversation: contracts.RemovePrivateConversation;
  addMember: contracts.AddMember;
  renameConversation: contracts.RenameConversation;
};

/**
 * Events client can receive from server
 */
export type ServerEventMap = {
  newMessage: contracts.EmitMessage;
  newMember: contracts.EmitMemberAdded;
  memberLeft: contracts.EmitMemberLeft;
  conversationUpdated: contracts.EmitConversationUpdated;
};

export function WebsocketProvider({ children, wsUrl, onError }: WebsocketProviderProps) {
  const [connectionState, setConnectionState] = useState<WebsocketConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (socketRef.current) return;

    const socket = io(wsUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setConnectionState('connecting');
      performHandshake(socket);
    };

    const handleDisconnect = () => {
      setConnectionState('disconnected');
      setUserId(null);
    };

    const handleError = (err: Error) => {
      const errorMessage = err.message || 'Connection error';
      setError(errorMessage);
      setConnectionState('error');
      onError?.(errorMessage);
      console.error('[WebSocket Error]', errorMessage);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
    };
  }, [wsUrl, onError]);

  const emitWithAck = useCallback(
    async <T extends keyof ClientEventMap>(
      event: T,
      data: ClientEventMap[T],
      timeoutMs: number = 5000,
    ): Promise<contracts.AckResponse> => {
      const sock = socketRef.current;
      if (!sock) {
        throw new Error('Socket not initialized');
      }

      return new Promise((resolve, reject) => {
        let timedOut = false;
        const timer = setTimeout(() => {
          timedOut = true;
          reject(new Error(`${String(event)} acknowledgement timed out`));
        }, timeoutMs);

        sock.emit(event, data, (response: contracts.AckResponse) => {
          clearTimeout(timer);
          if (timedOut) return;
          resolve(response);
        });
      });
    },
    [],
  );

  const emit = useCallback(<T extends keyof ServerEventMap>(event: T, data: ServerEventMap[T]) => {
    socketRef.current?.emit(event, data);
  }, []);

  const performHandshake = useCallback(
    async (socket: Socket) => {
      const jwt = getLocalJWT();
      const id = getLocalUserId();

      if (!jwt) {
        setError('No authentication token available (missing JWT)');
        setConnectionState('error');
        socket.disconnect();
        return;
      }

      // If id missing, try to fetch current user using JWT
      if (!id) {
        try {
          const response = await fetchUserInfo();
          setLocalUserId(response.user.id);
        } catch (err) {
          console.error('[Websocket] Failed to fetch user info:', err);
        }
      }

      if (!id) {
        setError('No user ID available for handshake');
        setConnectionState('error');
        socket.disconnect();
        return;
      }

      try {
        const response = await emitWithAck('initHandshake', { jwt, id }, 5000);

        if (response.success && response.userId) {
          setUserId(response.userId);
          setConnectionState('authenticated');
          setError(null);
        } else {
          const errorMsg = response.error || 'Authentication failed';
          setError(errorMsg);
          setConnectionState('error');
          socket.disconnect();
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
        setError(errorMessage);
        setConnectionState('error');
        console.error('[Websocket] Handshake failed:', errorMessage);
        socket.disconnect();
      }
    },
    [emitWithAck],
  );

  const value: WebsocketContextType = {
    socket: socketRef.current,
    connectionState,
    error,
    userId,
    isConnected: socketRef.current?.connected ?? false,
    isAuthenticated: connectionState === 'authenticated',
    emit,
    emitWithAck,
  };

  return <WebsocketContext.Provider value={value}>{children}</WebsocketContext.Provider>;
}
