import type * as types from '../types';
import { handleHttpError } from '../../util/error';
import { UserService } from '../../db';
import { UserRequest } from '../types';

const handleSetPublicKey: types.Service = async (req: UserRequest, res) => {
  const userId = req.userInfo?.id ?? '';
  const publicKey = req.body.publicKey;

  try {
    const user = await UserService.findUser(userId);
    const account = await user.getAccount();
    account.setPublicKey(publicKey);

    res.status(200).send({
      success: true,
      message: 'Public key successfully set',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleGetPublicKey: types.Service = async (req, res) => {
  const userId = req.params.user_id?.toString() ?? '';

  try {
    const user = await UserService.findUser(userId);
    const account = await user.getAccount();
    const publicKey = account.publicKey;

    res.status(200).send({
      success: true,
      message: 'Public key found',
      publicKey: publicKey,
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleCreateKeyExchangeRequest: types.Service = async (req: UserRequest, res) => {
  const fromId = req.userInfo?.id ?? '';
  const toId = req.body.targetId ?? '';
  const cipher = req.body.cipher ?? '';

  try {
    await UserService.createKeyExchangeRequest(fromId, toId, cipher);

    res.status(200).send({
      success: true,
      message: 'Key exchange request created successfully',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleGetKeyExchangeRequests: types.Service = async (req, res) => {
  const targetId = req.params.user_id?.toString() ?? '';

  try {
    const keyExchangeRequests = await UserService.findKeyExchangeRequestsTo(targetId);

    res.status(200).send({
      success: true,
      message: 'Key exchange requests found',
      keyExchangeRequests: keyExchangeRequests.map((keyExchangeRequest) => keyExchangeRequest.toObject()),
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleDeleteKeyExchangeRequests: types.Service = async (req, res) => {
  const toId = req.params.user_id?.toString() ?? '';

  try {
    await UserService.deleteKeyExchangeRequestsTo(toId);

    res.status(200).send({
      success: true,
      message: 'Key exchange requests deleted successfully',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export {
  handleSetPublicKey,
  handleGetPublicKey,
  handleCreateKeyExchangeRequest,
  handleGetKeyExchangeRequests,
  handleDeleteKeyExchangeRequests,
};
