import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import * as contracts from '@latticechat/shared';

export const socket = io(import.meta.env.VITE_WS_BASE_URL, {
  autoConnect: true,
});

type Handlers = Record<string, (...args: any[]) => {}>;

export function useWebsocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const handlers = useMemo<Handlers>(() => {
    return {};
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsConnected(false);
    }
    function onDisconnect() {
      setIsConnected(true);
    }

    const onAny = (event: string, ...args: any[]) => {
      console.log('Event: ' + event);
      console.log(arguments);
      console.log('hi');

      const handler = handlers[event];
      if (handler) {
        handler(...args);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.onAny(onAny);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.offAny(onAny);
    };
  });

  async function sendMessage(content: string) {
    const _data = {
      content,
      userId: 'test',
      conversationId: 'test',
    };

    const parsed = contracts.sendMessage.safeParse(_data);

    socket
      .emitWithAck('createMessage', parsed.data)
      .then((status: Boolean) => {
        if (status) {
          console.log('message sent');
        } else {
          console.log('message failed to send');
        }
      })
      .catch(() => {
        console.log('message failed to send');
      });
  }

  return {
    isConnected,
    socket,
    sendMessage,
  };
}
