import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { WebsocketContext } from './WebsocketContext';
import type {
  WebsocketConnectionState,
  WebsocketContextType,
} from './WebsocketContext';
import {
  getLocalJWT,
  getLocalUserId,
  setLocalUserId,
} from '#/lib/util/storage';
import { fetchUserInfo } from '#/lib/api/user';

interface WebsocketProviderProps {
  children: ReactNode;
  wsUrl: string;
  onError?: (error: string) => void;
}

export function WebsocketProvider({
  children,
  wsUrl,
  onError,
}: WebsocketProviderProps) {
  const [connectionState, setConnectionState] =
    useState<WebsocketConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (socketRef.current) return; // Already initialized

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
    <R = any,>(
      event: string,
      data?: any,
      timeoutMs: number = 5000,
    ): Promise<R> => {
      return new Promise((resolve, reject) => {
        const sock = socketRef.current;
        if (!sock) {
          reject(new Error('Socket not initialized'));
          return;
        }
        try {
          let timedOut = false;
          const timer = setTimeout(() => {
            timedOut = true;
            reject(new Error(`${event} acknowledgement timed out`));
          }, timeoutMs);

          sock.emit(event, data, (err: any, res: R) => {
            clearTimeout(timer);
            if (timedOut) return;

            // Normalize ack parameter patterns from the server.
            // Server may call ack(err, res), or ack(res) with res in first param (boolean/object), or ack(true/false).
            let actualErr: any = null;
            let actualRes: any = undefined;

            if (err !== undefined && err !== null) {
              // If err is an object that looks like a response (contains success/error), treat it as result
              if (
                typeof err === 'object' &&
                ('success' in err || 'error' in err)
              ) {
                actualRes = err;
              } else if (typeof err === 'boolean') {
                // server used boolean first-arg as success flag
                actualRes = err as any;
              } else if (err instanceof Error) {
                actualErr = err;
              } else {
                // treat other truthy err values as errors
                actualErr = new Error(JSON.stringify(err));
              }
            } else {
              // err is null/undefined -> use res
              actualRes = res;
            }

            if (actualErr) {
              reject(
                actualErr instanceof Error
                  ? actualErr
                  : new Error(JSON.stringify(actualErr)),
              );
            } else {
              resolve(actualRes);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    },
    [],
  );

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const performHandshake = useCallback(
    async (socket: Socket) => {
      const jwt = getLocalJWT();
      let id = getLocalUserId();

      if (!jwt) {
        setError('No authentication token available (missing JWT)');
        setConnectionState('error');
        socket.disconnect();
        return;
      }

      // If id missing, try to fetch current user using JWT
      if (!id) {
        try {
          const me = await fetchUserInfo();
          if (me && (me as any).user && (me as any).user.id) {
            id = (me as any).user.id;
            setLocalUserId(id);
          }
        } catch (err) {}
      }

      if (!id) {
        setError('No user ID available for handshake');
        setConnectionState('error');
        socket.disconnect();
        return;
      }

      try {
        const response = await emitWithAck<
          { jwt?: string },
          { success?: boolean; userId?: string; error?: string }
        >(
          'initHandshake',
          {
            jwt,
            id,
          },
          5000,
        );

        if (response?.success && response?.userId) {
          setUserId(response.userId);
          setConnectionState('authenticated');
          setError(null);
        } else {
          const errorMsg = (response as any)?.error || 'Authentication failed';
          setError(errorMsg);
          setConnectionState('error');
          socket.disconnect();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : JSON.stringify(err);
        setError(errorMessage);
        setConnectionState('error');
        console.error(
          '[Websocket] handshake failed',
          err,
          'message:',
          errorMessage,
        );
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

  return (
    <WebsocketContext.Provider value={value}>
      {children}
    </WebsocketContext.Provider>
  );
}
