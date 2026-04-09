import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type * as contracts from '@latticechat/shared';
import type { UserInfo } from '../api/user';
import { useUser } from '../context/UserContext';
import { getLocalJWT } from '../util/storage';

export const socket = io(import.meta.env.VITE_WS_BASE_URL, {
  autoConnect: true,
});

export function useWebsocket() {
  const { userInfo } = useUser();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [handshakeComplete, setHandshakeComplete] = useState(socket.connected);

  useEffect(() => {
    const jwt = getLocalJWT() || '';

    if (userInfo.data && !handshakeComplete && jwt) {
      const data: contracts.InitHandshake = {
        jwt,
        id: userInfo.data.id,
      };

      socket.emitWithAck('initHandshake', data).then((response) => {
        if (response) {
          setHandshakeComplete(true);
        } else {
          setHandshakeComplete(false);
        }
      });
    }

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.close();
    };
  }, [userInfo]);

  async function createMessage(data: contracts.CreateMessage) {
    const ack: boolean = await socket.emitWithAck('createMessage', data);
    return {
      success: ack,
    };
  }

  return {
    isConnected,
    socket,
    createMessage,
  };
}
