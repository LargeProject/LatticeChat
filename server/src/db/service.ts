import { Conversation, Message, User } from './models';
import actions from '@latticechat/shared';

function createConversationName(memberNames: string[]) {
  return memberNames.join(', ');
}

export async function createConversation(data: actions.CreateConversation) {
  const { ownerId, memberIds } = data;
  const owner = await User.findById(ownerId);

  const members = await User.find({ _id: { $in: memberIds } });
  const name =
    data.name ??
    createConversationName(members.map((m) => m.displayUsername ?? m.username));

  const conversation = await Conversation.create({
    ...(owner != null && { owner: owner._id }),
    name,
    members: members.map((m) => m._id),
  });

  return conversation;
}

export async function removePrivateConversation(
  data: actions.RemovePrivateConversation,
) {
  const { memberIds } = data;
  const [memberId1, memberId2] = memberIds;

  const conversation = await Conversation.findOne({
    members: {
      $all: [memberId1, memberId2],
      $size: 2,
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  await conversation.deleteOne();
}

export async function createMessage(data: actions.CreateMessage) {
  const { senderId, conversationId, content } = data;
  const sender = await User.findById(senderId);
  if (!sender) {
    return new Error('User not found');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return new Error('Conversation not found');
  }

  const message = await Message.create({
    sender: sender._id,
    conversation: conversation._id,
    content,
  });

  return message;
}
