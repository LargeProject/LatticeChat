import type * as actions from '@latticechat/shared';
import type { Conversation as SharedConversation } from '@latticechat/shared';
import { Conversation, Message, User } from '../models';
import {
  ConversationNotFoundError,
  DirectMessageInviteError,
  MemberExistsError,
  UserNotFoundError,
  NotFriendsError,
  NotMemberError,
} from '../../util/error';
import type { ConversationDocument } from '../schemas/Conversation';

function createConversationName(memberNames: string[]) {
  return memberNames.join(', ');
}

export class ConversationService {
  static async getConversationMessages(conversationId: string) {
    const messages = await Message.find({ conversationId });

    return messages;
  }

  static async findConversation(conversationId: string) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new ConversationNotFoundError();
    }

    return conversation;
  }

  static async findConversations(conversationsId: string[]): Promise<ConversationDocument[]> {
    return await Conversation.find({ _id: { $in: conversationsId } });
  }

  static async createConversation(data: actions.CreateConversation, isDirectMessage: boolean) {
    const { ownerId, memberIds } = data;
    const owner = await User.findById(ownerId);

    const members = await User.find({ _id: { $in: memberIds } });
    const name = isDirectMessage ? null : (data.name ?? createConversationName(members.map((m) => m.name)));

    const conversation = await Conversation.create({
      ...(owner != null && { owner: owner._id }),
      name,
      memberIds: members.map((m) => m._id),
      isDirectMessage,
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
      isDirectMessage: true,
    });

    if (!conversation) {
      throw new ConversationNotFoundError();
    }

    await conversation.deleteOne();
  }

  static async addMemberToConversation(data: { conversationId: string; userId: string; adderId: string }) {
    const conversation = await this.findConversation(data.conversationId);

    if (conversation.isDirectMessage) {
      throw new DirectMessageInviteError();
    }

    // Ensure requester is a member of the conversation
    const isRequesterMember = conversation.memberIds.some((m: any) => m.toString() === data.adderId);
    if (!isRequesterMember) {
      throw new NotMemberError();
    }

    const adder = await User.findById(data.adderId);
    const target = await User.findById(data.userId);

    if (!adder || !target) {
      throw new UserNotFoundError();
    }

    // Only allow adding users who are friends of the adder
    if (!adder.hasFriend(target._id)) {
      throw new NotFriendsError();
    }

    // If already a member, noop
    if (conversation.memberIds.some((m: any) => m.toString() === target._id.toString())) {
      throw new MemberExistsError();
    }

    // // Add member to conversation and add conversation to user's conversationIds
    // await Conversation.updateOne({ _id: conversation._id }, { $addToSet: { memberIds: target._id } });
    // await User.updateOne({ _id: target._id }, { $addToSet: { conversationIds: conversation._id } });

    return {
      conversationId: conversation._id.toString(),
      userId: target._id.toString(),
      addedBy: data.adderId,
      addedAt: new Date(),
    };
  }
}
