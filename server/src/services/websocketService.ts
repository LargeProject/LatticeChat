import * as db from '../db';
import type { WebsocketContext } from '../lib/websocket/types';
import { WebsocketError } from '../lib/websocket/types';
import type * as actions from '@latticechat/shared';

export class MessageService {
  static async handleCreateMessage(
    data: actions.CreateMessage,
    context: WebsocketContext
  ): Promise<boolean> {
    try {

      const message = await db.createMessage(data);
      if (!message || message instanceof Error) {
        console.error('[MessageService] createMessage returned invalid result', message);
        throw new WebsocketError('Failed to create message', 'MESSAGE_CREATE_FAILED', 400);
      }

      const conversation = await db.getConversation(data.conversationId);
      if (!conversation) {
        console.error('[MessageService] conversation not found', data.conversationId);
        throw new WebsocketError('Conversation not found', 'CONVERSATION_NOT_FOUND', 404);
      }

      const emitMessage = {
        id: message._id?.toString ? message._id.toString() : (message.id || message._id),
        conversationId: message.conversationId?.toString ? message.conversationId.toString() : message.conversationId,
        senderId: message.senderId?.toString ? message.senderId.toString() : message.senderId,
        content: message.content,
        createdAt: message.createdAt || Date.now(),
      };

      this.broadcastToConversationMembers(context, conversation.memberIds, 'newMessage', emitMessage);
      return true;
    } catch (error) {
      if (error instanceof WebsocketError) {
        console.error('[MessageService] websocket error', error.code, error.message);
        throw error;
      }
      console.error('[MessageService] Error creating message:', error);
      throw new WebsocketError('Failed to create message', 'MESSAGE_CREATE_ERROR', 500);
    }
  }

  static async handleCreateConversation(
    data: actions.CreateConversation,
    context: WebsocketContext
  ): Promise<boolean> {
    try {
      const conversation = await db.createConversation(data);
      if (!conversation || conversation instanceof Error) {
        throw new WebsocketError(
          'Failed to create conversation',
          'CONVERSATION_CREATE_FAILED',
          400
        );
      }

      // Notify all members of the new conversation
      this.broadcastToUserList(context, conversation.memberIds.map((m: any) => m.toString()), 'newConversation', conversation);
      return true;
    } catch (error) {
      if (error instanceof WebsocketError) {
        throw error;
      }
      console.error('Error creating conversation:', error);
      throw new WebsocketError(
        'Failed to create conversation',
        'CONVERSATION_CREATE_ERROR',
        500
      );
    }
  }

  private static broadcastToConversationMembers(
    context: WebsocketContext,
    members: any[],
    eventName: string,
    data: any
  ) {
    const { server } = context;
    for (const memberId of members) {
      const memberIdStr = memberId.toString();
      server.of('/').in(memberIdStr).emit(eventName, data);
    }
  }

  private static broadcastToUserList(
    context: WebsocketContext,
    userIds: string[],
    eventName: string,
    data: any
  ) {
    const { server } = context;
    for (const userId of userIds) {
      server.of('/').in(userId).emit(eventName, data);
    }
  }
}
