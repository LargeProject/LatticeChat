import { MessageService, ConversationService, UserService } from '../db';
import type { WebsocketContext } from '../lib/websocket/types';
import { WebsocketError } from '../lib/websocket/types';
import type * as actions from '@latticechat/shared';

export class WebsocketHandlers {
  static async handleCreateMessage(data: actions.CreateMessage, context: WebsocketContext): Promise<boolean> {
    try {
      const message = await MessageService.createMessage(data);
      if (message instanceof Error) {
        console.error('[MessageService] createMessage returned invalid result', message);
        throw new WebsocketError('Failed to create message', 'MESSAGE_CREATE_FAILED', 400);
      }

      const conversation = await ConversationService.getConversation(data.conversationId);

      const emitMessage = {
        id: message._id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        content: message.content,
        createdAt: message.createdAt,
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

  static async handleCreateConversation(data: actions.CreateConversation, context: WebsocketContext): Promise<boolean> {
    try {
      const conversation = await ConversationService.createConversation(data);

      // Notify all members of the new conversation
      this.broadcastToUserList(
        context,
        conversation.memberIds.map((m: any) => m.toString()),
        'newConversation',
        conversation,
      );
      return true;
    } catch (error) {
      if (error instanceof WebsocketError) {
        throw error;
      }
      console.error('Error creating conversation:', error);
      throw new WebsocketError('Failed to create conversation', 'CONVERSATION_CREATE_ERROR', 500);
    }
  }

  static async handleAddMember(data: actions.AddMember, context: WebsocketContext): Promise<boolean> {
    try {
      const adderId = context.userId;
      const result = await ConversationService.addMemberToConversation({ ...data, adderId });

      // Broadcast to all current members + the newly added member
      const conversation = await ConversationService.getConversation(data.conversationId);
      const memberIds = conversation.memberIds.map((m: any) => m.toString());
      if (!memberIds.includes(result.userId)) memberIds.push(result.userId);

      this.broadcastToConversationMembers(context, memberIds, 'newMember', result);
      return true;
    } catch (error) {
      if (error instanceof WebsocketError) {
        throw error;
      }
      console.error('[MessageService] Error adding member:', error);
      throw new WebsocketError('Failed to add member', 'ADD_MEMBER_ERROR', 500);
    }
  }

  private static broadcastToConversationMembers(
    context: WebsocketContext,
    members: any[],
    eventName: string,
    data: any,
  ) {
    const { server } = context;
    for (const memberId of members) {
      const memberIdStr = memberId.toString();
      server.of('/').in(memberIdStr).emit(eventName, data);
    }
  }

  private static broadcastToUserList(context: WebsocketContext, userIds: string[], eventName: string, data: any) {
    const { server } = context;
    for (const userId of userIds) {
      server.of('/').in(userId).emit(eventName, data);
    }
  }
}
