import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import * as contracts from '@latticechat/shared';

export const socket = io(import.meta.env.VITE_WS_BASE_URL, {
  autoConnect: true,
});

export function useWebsocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const handlers = useRef<Set<(...args: any[]) => any>>(new Set());

  useEffect(() => {
    function onConnect() {
      setIsConnected(false);
    }
    function onDisconnect() {
      setIsConnected(true);
    }
    function onCreateMessage(data: contracts.CreateMessage) {
      handlers.current.forEach((c) => c(data));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('createMessage', onCreateMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('createMessage', onCreateMessage);
      socket.close();
    };
  }, []);

  async function createMessage(data: contracts.CreateMessage) {
    const ack: boolean = await socket.emitWithAck('createMessage', data);
    return {
      success: ack,
    };
  }

  // Triggers when a new message is received from server
  const onMessageReceive = useCallback(
    (handler: (data: contracts.CreateMessage) => any) => {
      handlers.current.add(handler);

      return () => {
        handlers.current.delete(handler);
      };
    },
    [],
  );

  return {
    isConnected,
    socket,
    createMessage,
    onMessageReceive,
  };
}

const { onMessageReceive } = useWebsocket();
onMessageReceive((data) => {
  console.log(data);
});
