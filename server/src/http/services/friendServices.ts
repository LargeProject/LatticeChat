import type { Service, UserRequest } from '../types';
import type { CreateConversation, RemovePrivateConversation } from '@latticechat/shared';
import { handleHttpError } from '../../util/error';
import * as db from '../../db';

const handleGetFriendRequests: Service = async (req: UserRequest, res) => {
  const userId = req.userInfo?.id ?? '';

  try {
    const friendRequests = await db.UserService.getFriendRequests(userId);

    res.status(200).send({
      success: true,
      message: 'Friend requests were successfully found',
      friendRequests: friendRequests.map((friend) => friend.toObject()),
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleAcceptFriendRequest: Service = async (req: UserRequest, res) => {
  const senderId = req.userInfo?.id ?? '';
  const targetId = req.body.targetId ?? '';

  try {
    await db.UserService.acceptFriendRequest(targetId, senderId);

    res.status(200).send({
      success: true,
      message: 'Friend request successfully accepted',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleAddFriendRequest: Service = async (req: UserRequest, res) => {
  const senderId = req.userInfo?.id ?? '';
  const targetUsername = req.body.targetUsername ?? '';

  try {
    const target = await db.UserService.getBasicUserInfoByName(targetUsername);
    await db.UserService.createFriendRequest(senderId, target.id);

    res.status(200).send({
      success: true,
      message: 'Friend request successfully sent',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleRemoveFriendRequest: Service = async (req: UserRequest, res) => {
  const senderId = req.userInfo?.id ?? '';
  const targetId = req.body.targetId ?? '';

  try {
    await db.UserService.removeFriendRequest(senderId, targetId);
    res.status(200).send({
      success: true,
      message: 'Friend request successfully deleted',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleRemoveFriend: Service = async (req: UserRequest, res) => {
  const senderId = req.userInfo?.id ?? '';
  const targetId = req.body.targetId ?? '';

  try {
    await db.UserService.removeFriend(senderId, targetId);

    const removePrivateConversationData: RemovePrivateConversation = {
      memberIds: [senderId, targetId],
    };
    await db.ConversationService.removePrivateConversation(removePrivateConversationData);

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
  handleAcceptFriendRequest,
};
