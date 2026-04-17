import { useEffect, useCallback, useRef } from 'react';
import { useWebsocketContext } from '../context/WebsocketContext';
import type { ServerEventMap } from '../context/WebsocketProvider';

type EventCallback<T> = (data: T) => void;

export function useWebsocketListener<T extends keyof ServerEventMap>(
  eventName: T,
  callback: EventCallback<ServerEventMap[T]>,
  enabled: boolean = true,
  deps: any[] = [],
) {
  const context = useWebsocketContext();
  const callbackRef = useRef(callback);

  // Update the callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const effectCallback = callbackRef.current;
    if (!enabled || !context.socket) {
      return;
    }

    // Only register listeners after authentication; if not authenticated, skip until state changes
    if (!context.isAuthenticated) {
      return;
    }

    context.socket.on(eventName as string, effectCallback);

    return () => {
      context.socket?.off(eventName as string, effectCallback);
    };
  }, [eventName, enabled, context.socket, context.isAuthenticated, ...deps]);
}
