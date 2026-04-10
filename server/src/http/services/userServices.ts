import type * as types from '../types';
import { deleteUser, getBasicUserInfoById, getBasicUserInfoByName } from '../../db';
import { handleHttpError } from '../../util/error';

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

export { handleGetBasicUserInformation, handleDeleteUser };
