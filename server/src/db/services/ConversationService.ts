import { User, Conversation, Message } from '../models';
import type actions from '@latticechat/shared';

const errors = {
  CONVERSATION_NOT_FOUND: 'Conversation not found',
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
      throw new Error(errors.CONVERSATION_NOT_FOUND);
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
      throw new Error('Conversation not found');
    }

    await conversation.deleteOne();
  }
}
