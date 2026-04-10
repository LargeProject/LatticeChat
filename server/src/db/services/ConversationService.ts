import type * as actions from '@latticechat/shared';
import { Conversation, Message, User } from '../models';

export const ConversationServiceErrors = {
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  CANNOT_ADD_TO_DM: 'Cannot add members to a direct message.',
  NOT_A_MEMBER: 'You are not a member of this conversation',
  NOT_FRIENDS: 'Target user is not your friend',
  ALREADY_MEMBER: 'User is already a member of this conversation',
};

function createConversationName(memberNames: string[]) {
  return memberNames.join(', ');
}

export class ConversationService {
  static async getConversationMessages(conversationId: string) {
    const messages = await Message.find({ conversationId });

    return messages;
  }

  static async getConversation(conversationId: string) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error(ConversationServiceErrors.CONVERSATION_NOT_FOUND);
    }

    return conversation;
  }

  static async createConversation(data: actions.CreateConversation) {
    const { ownerId, memberIds } = data;
    const owner = await User.findById(ownerId);

    const members = await User.find({ _id: { $in: memberIds } });
    const name = data.name ?? createConversationName(members.map((m) => m.name));

    const conversation = await Conversation.create({
      ...(owner != null && { owner: owner._id }),
      name,
      memberIds: members.map((m) => m._id),
    });

    return conversation;
  }

  static async removePrivateConversation(data: actions.RemovePrivateConversation) {
    const { memberIds } = data;
    const [memberId1, memberId2] = memberIds;

    const conversation = await Conversation.findOne({
      memberIds: {
        $all: [memberId1, memberId2],
        $size: 2,
      },
    });

    if (!conversation) {
      throw new Error(ConversationServiceErrors.CONVERSATION_NOT_FOUND);
    }

    await conversation.deleteOne();
  }

  static async addMemberToConversation(data: { conversationId: string; userId: string; adderId: string }) {
    const conversation = await this.getConversation(data.conversationId);

    if (conversation.isDirectMessage) {
      throw new Error(ConversationServiceErrors.CANNOT_ADD_TO_DM);
    }

    // Ensure requester is a member of the conversation
    const isRequesterMember = conversation.memberIds.some((m: any) => m.toString() === data.adderId);
    if (!isRequesterMember) {
      throw new Error(ConversationServiceErrors.NOT_A_MEMBER);
    }

    // Import UserService locally to avoid circular deps
    const { UserService } = require('./UserService');
    const adder = await UserService.findUser(data.adderId, 'user');
    const target = await UserService.findUser(data.userId, 'target');

    // Only allow adding users who are friends of the adder
    if (!adder.hasFriend(target._id)) {
      throw new Error(ConversationServiceErrors.NOT_FRIENDS);
    }

    // If already a member, noop
    if (conversation.memberIds.some((m: any) => m.toString() === target._id.toString())) {
      throw new Error(ConversationServiceErrors.ALREADY_MEMBER);
    }

    // Add member to conversation and add conversation to user's conversationIds
    await Conversation.updateOne({ _id: conversation._id }, { $addToSet: { memberIds: target._id } });
    await User.updateOne({ _id: target._id }, { $addToSet: { conversationIds: conversation._id } });

    return {
      conversationId: conversation._id.toString(),
      userId: target._id.toString(),
      addedBy: data.adderId,
      addedAt: new Date(),
    };
  }
}
