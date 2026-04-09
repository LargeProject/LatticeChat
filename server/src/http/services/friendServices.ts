import { Service, UserRequest } from '../types';
import {
  createConversation,
  createFriendRequest,
  getFriendRequests,
  removeFriend,
  removeFriendRequest,
  removePrivateConversation,
} from '../../db';
import {
  CreateConversation,
  RemovePrivateConversation,
} from '@latticechat/shared';
import { handleHttpError } from '../../util/error';

const handleGetFriendRequests: Service = async (req: UserRequest, res) => {
  const userId = req.params.user_id?.toString() ?? '';

  try {
    const friendRequests = await getFriendRequests(userId);

    res.status(200).send({
      success: true,
      message: 'Friend requests were successfully found',
      friendRequests: friendRequests.map((friend) => friend.toObject()),
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleAddFriendRequest: Service = async (req: UserRequest, res) => {
  const senderId = req.params.user_id?.toString() ?? '';
  const targetId = req.body.target_id ?? '';

  try {
    const friendRequest = await createFriendRequest(senderId, targetId);
    if (!friendRequest) {
      res.status(200).send({
        success: true,
        message: 'Friend successfully added',
      });
    } else {
      res.status(200).send({
        success: true,
        message: 'Friend request successfully sent',
      });
    }
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleRemoveFriendRequest: Service = async (req: UserRequest, res) => {
  const type = req.query.type;

  const senderId = req.params.user_id?.toString() ?? '';
  const targetId = req.body.target_id ?? '';

  let fromId = '';
  let toId = '';
  if (type === 'outgoing') {
    fromId = senderId;
    toId = targetId;
  } else if (type === 'incoming') {
    fromId = targetId;
    toId = senderId;
  } else {
    res.status(409).send({
      success: false,
      message: 'Unknown friend request type: ' + type,
    });
    return;
  }

  try {
    await removeFriendRequest(fromId, toId);
    res.status(200).send({
      success: true,
      message: 'Friend request successfully deleted',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleRemoveFriend: Service = async (req: UserRequest, res) => {
  const senderId = req.params.user_id?.toString() ?? '';
  const targetId = req.body.target_id ?? '';

  try {
    await removeFriend(senderId, targetId);

    const removePrivateConversationData: RemovePrivateConversation = {
      memberIds: [senderId, targetId],
    };
    await removePrivateConversation(removePrivateConversationData);

    res.status(200).send({
      success: true,
      message: 'Friend successfully removed',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export {
  handleGetFriendRequests,
  handleAddFriendRequest,
  handleRemoveFriendRequest,
  handleRemoveFriend,
};
