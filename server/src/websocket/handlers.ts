import type * as actions from '@latticechat/shared';
import { ConversationService, MessageService, UserService } from '../db';
import { ACK_SUCCESS } from '../lib/websocket';
import type { WebsocketContext } from '../lib/websocket/types';
import { WebsocketError } from '../lib/websocket/types';
import auth from '../util/auth';
import { Logger } from '../util/log';

function broadcastToConversationMembers(context: WebsocketContext, members: any[], eventName: string, data: any) {
  const { server } = context;
  for (const memberId of members) {
    const memberIdStr = memberId.toString();
    server.of('/').in(memberIdStr).emit(eventName, data);
  }
}

function broadcastToUserList(context: WebsocketContext, userIds: string[], eventName: string, data: any) {
  const { server } = context;
  for (const userId of userIds) {
    server.of('/').in(userId).emit(eventName, data);
  }
}

export class WebsocketHandlers {
  static async initHandshake(data: actions.InitHandshake, context: WebsocketContext): Promise<actions.AckResponse> {
    if (!data.jwt) {
      throw new WebsocketError('Missing JWT token', 'AUTH_MISSING_TOKEN', 401);
    }

    try {
      const session = await auth.api.getSession({
        headers: {
          Authorization: `Bearer ${data.jwt}`,
        },
      });

      if (!session?.user.id) {
        throw new WebsocketError('Invalid or expired token', 'AUTH_INVALID_TOKEN', 401);
      }

      context.socket.data.userId = session.user.id;
      context.connectionManager.addSocket(session.user.id, context.socket.id);
      try {
        context.socket.join(session.user.id);
      } catch (e) {
        Logger.error('Failed to join user room', e);
      }

      Logger.log(
        `User ${session.user.id} authenticated (socket: ${context.socket.id}) and joined room ${session.user.id}`,
      );

      return {
        ...ACK_SUCCESS,
        userId: session.user.id,
      };
    } catch (error) {
      if (error instanceof WebsocketError) {
        throw error;
      }
      Logger.error('Auth error:', error);
      throw new WebsocketError('Authentication failed', 'AUTH_FAILED', 500);
    }
  }

  static async handleCreateMessage(
    data: actions.CreateMessage,
    context: WebsocketContext,
  ): Promise<actions.AckResponse> {
    try {
      const message = await MessageService.createMessage(data);
      const conversation = await ConversationService.findConversation(data.conversationId);

      const emitMessage = {
        id: message._id.toString(),
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
      };

      broadcastToConversationMembers(context, conversation.memberIds, 'newMessage', emitMessage);
      return ACK_SUCCESS;
    } catch (error) {
      if (error instanceof WebsocketError) {
        Logger.error('[MessageService] websocket error', error.code, error.message);
        throw error;
      }
      Logger.error('[MessageService] Error creating message:', error);
      throw new WebsocketError('Failed to create message', 'MESSAGE_CREATE_ERROR', 500);
    }
  }

  static async handleCreateConversation(
    data: actions.CreateConversation,
    context: WebsocketContext,
  ): Promise<actions.AckResponse> {
    try {
      const conversation = await ConversationService.createConversation(data, false);

      // Notify all members of the new conversation
      broadcastToUserList(
        context,
        conversation.memberIds.map((m: any) => m.toString()),
        'newConversation',
        conversation,
      );

      return { ...ACK_SUCCESS, conversationId: conversation._id.toString() };
    } catch (error) {
      if (error instanceof WebsocketError) {
        throw error;
      }
      Logger.error('Error creating conversation:', error);
      throw new WebsocketError('Failed to create conversation', 'CONVERSATION_CREATE_ERROR', 500);
    }
  }

  static async handleAddMember(data: actions.AddMember, context: WebsocketContext): Promise<actions.AckResponse> {
    try {
      const adderId = context.userId;
      const result = await ConversationService.addMemberToConversation({ ...data, adderId });

      // Broadcast to all current members + the newly added member
      const conversation = await ConversationService.findConversation(data.conversationId);
      const memberIds = conversation.memberIds.map((m: any) => m.toString());
      if (!memberIds.includes(result.userId)) memberIds.push(result.userId);

      broadcastToConversationMembers(context, memberIds, 'newMember', result);

      // Emit a system message to all members
      try {
        const adderUser = await UserService.findUser(result.addedBy, 'user');
        const addedUser = await UserService.findUser(result.userId, 'target');

        const message = await MessageService.createMessage({
          conversationId: conversation._id.toString(),
          senderId: 'system',
          content: `${addedUser.name} was added by ${adderUser.name}`,
        });

        const emitMessage = {
          id: message._id.toString(),
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
        };

        broadcastToConversationMembers(context, conversation.memberIds, 'newMessage', emitMessage);
      } catch (e) {
        Logger.error(e);
      }

      return ACK_SUCCESS;
    } catch (error) {
      if (error instanceof WebsocketError) {
        throw error;
      }
      Logger.error('[MessageService] Error adding member:', error);
      throw new WebsocketError('Failed to add member', 'ADD_MEMBER_ERROR', 500);
    }
  }
}
