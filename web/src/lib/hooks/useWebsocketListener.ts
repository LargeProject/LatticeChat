import { useEffect, useCallback, useRef } from 'react';
import { useWebsocketContext } from '../context/WebsocketContext';

type EventCallback<T = any> = (data: T) => void;

export function useWebsocketListener<T = any>(eventName: string, callback: EventCallback<T>, enabled: boolean = true) {
  const context = useWebsocketContext();
  const callbackRef = useRef(callback);

  // Update the callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !context.socket) {
      return;
    }

    // Only register listeners after authentication; if not authenticated, skip until state changes
    if (!context.isAuthenticated) {
      return;
    }

    const wrappedCallback = (data: T) => {
      callbackRef.current(data);
    };

    context.socket.on(eventName, wrappedCallback);

    return () => {
      context.socket?.off(eventName, wrappedCallback);
    };
  }, [eventName, enabled, context.socket, context.isAuthenticated]);
}

export function useWebsocketListeners(listeners: Record<string, EventCallback>, enabled: boolean = true) {
  const context = useWebsocketContext();
  const listenersRef = useRef(listeners);

  useEffect(() => {
    listenersRef.current = listeners;
  }, [listeners]);

  useEffect(() => {
    if (!enabled || !context.socket) {
      return;
    }

    if (!context.isAuthenticated) {
      return;
    }

    const wrappedListeners: Record<string, EventCallback> = {};

    for (const [eventName, callback] of Object.entries(listenersRef.current)) {
      wrappedListeners[eventName] = (data: any) => {
        callback(data);
      };
      context.socket.on(eventName, wrappedListeners[eventName]);
    }

    return () => {
      for (const [eventName, callback] of Object.entries(wrappedListeners)) {
        context.socket?.off(eventName, callback);
      }
    };
  }, [enabled, context.socket, context.isAuthenticated]);
}
