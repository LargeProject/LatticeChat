import * as db from '../db';
import type { WebsocketContext } from '../lib/websocket/types';
import { WebsocketError } from '../lib/websocket/types';
import type * as actions from '@latticechat/shared';

export class MessageService {
  static async handleCreateMessage(data: actions.CreateMessage, context: WebsocketContext): Promise<boolean> {
    try {
      const message = await db.createMessage(data);
      if (message instanceof Error) {
        console.error('[MessageService] createMessage returned invalid result', message);
        throw new WebsocketError('Failed to create message', 'MESSAGE_CREATE_FAILED', 400);
      }

      const conversation = await db.getConversation(data.conversationId);

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
      const conversation = await db.createConversation(data);

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
      const { conversationId, userId } = data;
      const adderId = context.userId;

      const conversation = await db.getConversation(conversationId);

      // Can't add members to a DM, instead create a new conversation
      if (conversation.isDirectMessage) {
        throw new WebsocketError('Cannot add members to a direct message.', 'CANNOT_ADD_TO_DM', 403);
      }

      // Ensure requester is a member of the conversation
      const isRequesterMember = conversation.memberIds.some((m: any) => m.toString() === adderId);
      if (!isRequesterMember) {
        throw new WebsocketError('You are not a member of this conversation', 'NOT_A_MEMBER', 403);
      }

      const adder = await db.findUser(adderId, 'user');
      const target = await db.findUser(userId, 'target');

      // Only allow adding users who are friends of the adder
      if (!adder.hasFriend(target._id)) {
        throw new WebsocketError('Target user is not your friend', 'NOT_FRIENDS', 400);
      }

      // If already a member, noop
      if (conversation.memberIds.some((m: any) => m.toString() === target._id.toString())) {
        return true;
      }

      // Add member to conversation and add conversation to user's conversationIds
      await db.Conversation.updateOne({ _id: conversation._id }, { $addToSet: { memberIds: target._id } });
      await db.User.updateOne({ _id: target._id }, { $addToSet: { conversationIds: conversation._id } });

      const emit = {
        conversationId: conversation._id.toString(),
        userId: target._id.toString(),
        addedBy: adderId,
        addedAt: new Date(),
      };

      // Broadcast to all current members + the newly added member
      const memberIds = conversation.memberIds.map((m: any) => m.toString());
      if (!memberIds.includes(target._id.toString())) memberIds.push(target._id.toString());

      this.broadcastToConversationMembers(context, memberIds, 'newMember', emit);

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
