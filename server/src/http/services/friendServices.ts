import { Service, UserRequest } from '../types';
import {
  createConversation,
  createFriendRequest,
  removeFriend,
  removeFriendRequest,
  removePrivateConversation,
} from '../../db';
import {
  CreateConversation,
  RemovePrivateConversation,
} from '@latticechat/shared';
import { HttpError } from '../../util/error';

const handleAddFriendRequest: Service = async (req: UserRequest, res) => {
  const sessionBody = req.userSessionInfo;
  const senderId = sessionBody.user.id;
  const targetId = req.body.target_id ?? '';

  try {
    const friendRequest = await createFriendRequest(senderId, targetId);
    if (!friendRequest) {
      // create conversation
      const createConversationData: CreateConversation = {
        memberIds: [senderId, targetId],
      };
      await createConversation(createConversationData);

      res
        .status(200)
        .send({ success: true, message: 'Friend successfully added' });
    } else {
      res
        .status(200)
        .send({ success: true, message: 'Friend request successfully sent' });
    }
  } catch (error) {
    if (error instanceof HttpError) {
      res
        .status(error.statusCode)
        .send({ success: false, message: error.message });
      return;
    }

    res.status(500).send({ success: true, message: 'Unknown Error' });
  }
};

const handleRemoveFriendRequest: Service = async (req: UserRequest, res) => {
  const type = req.query.type;

  const sessionBody = req.userSessionInfo;
  const senderId = sessionBody.user.id;
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
  }

  try {
    await removeFriendRequest(fromId, toId);
    res.status(200).send({
      success: true,
      message: 'Friend request successfully deleted',
    });
  } catch (error) {
    if (error instanceof HttpError) {
      res
        .status(error.statusCode)
        .send({ success: false, message: error.message });
      return;
    }

    res.status(500).send({ success: true, message: 'Unknown Error' });
  }
};

const handleRemoveFriend: Service = async (req: UserRequest, res) => {
  const sessionBody = req.userSessionInfo;
  const senderId = sessionBody.user.id;
  const targetId = req.body.target_id ?? '';

  try {
    await removeFriend(senderId, targetId);

    const removePrivateConversationData: RemovePrivateConversation = {
      memberIds: [senderId, targetId],
    };
    await removePrivateConversation(removePrivateConversationData);

    res
      .status(200)
      .send({ success: true, message: 'Friend successfully removed' });
  } catch (error) {
    if (error instanceof HttpError) {
      res
        .status(error.statusCode)
        .send({ success: false, message: error.message });
      return;
    }

    res.status(500).send({ success: true, message: 'Unknown Error' });
  }
};

export {
  handleAddFriendRequest,
  handleRemoveFriendRequest,
  handleRemoveFriend,
};
