import { Conversation, FriendRequest, Message, User } from './models';
import actions from '@latticechat/shared';
import { HttpError } from '../util/error';

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

export async function createFriendRequest(senderId: string, targetId: string) {
  const sender = await User.findById(senderId);
  const target = await User.findById(targetId);

  if (sender == null) {
    throw new HttpError('User not found', 404);
  }

  if (target == null) {
    throw new HttpError('Target not found', 404);
  }

  if (sender.hasFriend(target._id)) {
    throw new HttpError('Already friends with this user', 409);
  }

  const targetFriendRequest = await target.getFriendRequestTo(sender._id);

  // check if target has pending request
  if (targetFriendRequest != null) {
    await targetFriendRequest.deleteOne();
    sender.addFriend(target._id);
    target.addFriend(sender._id);

    return null;
  } else {
    return await FriendRequest.create({
      from: sender.id,
      to: target.id,
    });
  }
}

export async function removeFriendRequest(fromId: string, toId: string) {
  const sender = await User.findById(fromId);
  const target = await User.findById(toId);

  if (sender == null) {
    throw new HttpError('User not found', 404);
  }

  if (target == null) {
    throw new HttpError('Target not found', 404);
  }

  const friendRequest = await FriendRequest.findOne({
    from: target._id,
    to: sender._id,
  });

  if (friendRequest == null) {
    throw new HttpError('Friend request not found', 404);
  }

  const result = await friendRequest.deleteOne();
  if (result.deletedCount === 0) {
    throw new HttpError('Failed to delete friend request', 500);
  }
}

export async function removeFriend(sourceId: string, targetId: string) {
  const sender = await User.findById(sourceId);
  const target = await User.findById(targetId);

  if (sender == null) {
    return new HttpError('User not found', 404);
  }

  if (target == null) {
    return new HttpError('Target not found', 404);
  }

  if (!sender.hasFriend(target._id)) {
    return new HttpError('Friend not found', 404);
  }

  sender.removeFriend(target._id);
  target.removeFriend(sender._id);
}
