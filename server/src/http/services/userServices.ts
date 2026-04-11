import type * as types from '../types';
import { ConversationService, UserService } from '../../db';
import { handleHttpError } from '../../util/error';
import { Conversation, User } from '../../db/models';
import * as contracts from '@latticechat/shared';
import { UserRequest } from '../types';

const handleGetBasicUserInformation: types.Service = async (req, res) => {
  const userId = req.params.user_id?.toString() ?? '';
  const byName = req.query.byName ?? 'false';

  try {
    let userInformation;
    if (byName === 'true') {
      userInformation = await UserService.getBasicUserInfoByName(userId);
    } else if (byName === 'false') {
      userInformation = await UserService.getBasicUserInfoById(userId);
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
    const hydratedUser = await UserService.findHydratedUser(userId);
    res.status(200).send({
      success: true,
      message: 'User successfully found',
      userInfo: hydratedUser,
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleDeleteUser: types.Service = async (req: UserRequest, res) => {
  const userId = req.userInfo.id ?? '';

  try {
    await UserService.deleteUser(userId);
    res.status(200).send({
      success: true,
      message: 'User successfully deleted',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export { handleGetBasicUserInformation, handleGetCurrentUser, handleDeleteUser };
