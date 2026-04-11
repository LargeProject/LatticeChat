import type { Service, UserRequest } from '../types';
import type {
  RemovePrivateConversation,
} from '@latticechat/shared';
import { handleHttpError } from '../../util/error';
import {ConversationService, UserService} from "../../db";

const handleGetFriendRequests: Service = async (req: UserRequest, res) => {
  const userId = req.params.user_id?.toString() ?? '';

  try {
    const friendRequests = await UserService.getFriendRequests(userId);

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
  const targetId = req.body.targetId ?? '';

  try {
    const friendRequest = await UserService.createFriendRequest(senderId, targetId);
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
  const targetId = req.body.targetId ?? '';

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
    await UserService.removeFriendRequest(fromId, toId);
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
  const targetId = req.body.targetId ?? '';

  try {
    await UserService.removeFriend(senderId, targetId);

    const removePrivateConversationData: RemovePrivateConversation = {
      memberIds: [senderId, targetId],
    };
    await ConversationService.removePrivateConversation(removePrivateConversationData);

    res.status(200).send({
      success: true,
      message: 'Friend successfully removed',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export { handleGetFriendRequests, handleAddFriendRequest, handleRemoveFriendRequest, handleRemoveFriend };
