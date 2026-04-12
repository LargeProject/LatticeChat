import { useCallback, useRef } from 'react';
import { useWebsocketContext } from '../context/WebsocketContext';
import type * as contracts from '@latticechat/shared';

export function useWebsocket() {
  const context = useWebsocketContext();
  const messageQueueRef = useRef<contracts.CreateMessage[]>([]);

  const createMessage = useCallback(
    async (data: contracts.CreateMessage) => {
      if (!context.socket || !context.isAuthenticated) {
        console.warn('Socket not connected or not authenticated, queuing message');
        messageQueueRef.current.push(data);
        return { success: false, queued: true };
      }

      try {
        const ack = await context.emitWithAck('createMessage', data);
        return ack;
      } catch (error) {
        console.error('Error sending message:', error);
        messageQueueRef.current.push(data);
        return { success: false, queued: true };
      }
    },
    [context.emitWithAck, context.socket, context.isAuthenticated],
  );

  const createConversation = useCallback(
    async (data: contracts.CreateConversation) => {
      if (!context.socket || !context.isAuthenticated) {
        console.warn('Socket not connected or not authenticated');
        return { success: false };
      }

      try {
        const ack = await context.emitWithAck('createConversation', data);
        return ack;
      } catch (error) {
        console.error('Error creating conversation:', error);
        return { success: false };
      }
    },
    [context.emitWithAck, context.socket, context.isAuthenticated],
  );

  const addMember = useCallback(
    async (conversationId: string, userId: string) => {
      if (!context.socket || !context.isAuthenticated) {
        console.warn('Socket not connected or not authenticated');
        return { success: false };
      }

      try {
        const ack = await context.emitWithAck('addMember', { conversationId, userId });
        return ack;
      } catch (error) {
        console.error('Error adding member:', error);
        return { success: false };
      }
    },
    [context.emitWithAck, context.socket, context.isAuthenticated],
  );

  const getMessageQueue = useCallback(() => {
    return messageQueueRef.current;
  }, []);

  const clearMessageQueue = useCallback(() => {
    messageQueueRef.current = [];
  }, []);

  return {
    isConnected: context.isConnected,
    isAuthenticated: context.isAuthenticated,
    connectionState: context.connectionState,
    error: context.error,
    userId: context.userId,
    socket: context.socket,
    createMessage,
    createConversation,
    addMember,
    getMessageQueue,
    clearMessageQueue,
  };
}
