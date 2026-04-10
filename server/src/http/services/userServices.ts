import type * as types from '../types';
import { ConversationService } from '../../db';
import { handleHttpError } from '../../util/error';
import { Conversation, User } from '../../db/models';
import * as contracts from '@latticechat/shared';

const handleGetBasicUserInformation: types.Service = async (req, res) => {
  const userId = req.params.user_id?.toString() ?? '';
  const byName = req.query.byName ?? false;

  try {
    let userInformation;
    if (byName === 'true') {
      userInformation = await getBasicUserInfoByName(userId);
    } else if (byName === 'false') {
      userInformation = await getBasicUserInfoById(userId);
    }

    res.status(200).send({
      success: true,
      message: 'User successfully found',
      basicUserInfo: userInformation,
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleGetCurrentUser: types.Service = async (req, res) => {
  const userId = (req as any).userInfo?.id?.toString() ?? '';

  try {
    const user = await findUser(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: 'User not found',
      });
    }

    // Fetch and hydrate conversations
    const conversationIds = user.conversationIds ?? [];
    const conversations = await Promise.all(
      conversationIds.map(async (convId) => {
        const conv = await Conversation.findById(convId);
        if (!conv) return null;

        const members = await User.find({ _id: { $in: conv.memberIds ?? [] } });
        return {
          id: conv._id.toString(),
          name: conv.name,
          ownerId: conv.ownerId?.toString(),
          members: members.map((m) => ({
            id: m._id.toString(),
            name: m.name,
            biography: m.biography,
            createdAt: m.createdAt,
          })),
        };
      }),
    );

    // Fetch and hydrate friends
    const friendIds = user.friendIds ?? [];
    const friends = friendIds.length > 0 ? await User.find({ _id: { $in: friendIds } }) : [];
    const friendList = friends.map((f) => ({
      id: f._id.toString(),
      name: f.name,
      biography: f.biography,
      createdAt: f.createdAt,
    }));

    const response: contracts.CurrentUserResponse = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        biography: user.biography,
        createdAt: user.createdAt,
      },
      conversations: conversations.filter(Boolean) as contracts.Conversation[],
      friends: friendList,
    };

    res.status(200).send(response);
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleDeleteUser: types.Service = async (req, res) => {
  const userId = req.params.user_id?.toString() ?? '';

  try {
    await deleteUser(userId);
    res.status(200).send({
      success: true,
      message: 'User successfully deleted',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export { handleGetBasicUserInformation, handleGetCurrentUser, handleDeleteUser };
