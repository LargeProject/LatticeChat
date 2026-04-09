import type * as types from '../types';
import { handleHttpError } from '../../util/error';
import {
  createKeyExchangeRequest,
  deleteKeyExchangeRequestsTo,
  findKeyExchangeRequestsTo,
  findUser,
} from '../../db';

const handleSetPublicKey: types.Service = async (req, res) => {
  const userId = req.params.user_id?.toString() ?? '';
  const publicKey = req.body.publicKey;

  try {
    const user = await findUser(userId);
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
    const user = await findUser(userId);
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

const handleCreateKeyExchangeRequest: types.Service = async (req, res) => {
  const fromId = req.params.user_id?.toString() ?? '';
  const toId = req.body.target_id ?? '';
  const cipher = req.body.cipher ?? '';

  try {
    await createKeyExchangeRequest(fromId, toId, cipher);

    res.status(200).send({
      success: true,
      message: 'Key exchange request created successfully',
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleGetKeyExchangeRequests: types.Service = async (req, res) => {
  const toId = req.params.user_id?.toString() ?? '';

  try {
    const keyExchangeRequests = await findKeyExchangeRequestsTo(toId);

    res.status(200).send({
      success: true,
      message: 'Key exchange requests found',
      keyExchangeRequests: keyExchangeRequests.map((keyExchangeRequest) =>
        keyExchangeRequest.toObject(),
      ),
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleDeleteKeyExchangeRequests: types.Service = async (req, res) => {
  const toId = req.params.user_id?.toString() ?? '';

  try {
    await deleteKeyExchangeRequestsTo(toId);

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
