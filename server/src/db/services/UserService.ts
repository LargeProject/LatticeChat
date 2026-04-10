import { FriendRequest, User } from '../models';
import { ConversationService } from './ConversationService';
import type { CreateConversation } from '@latticechat/shared';
import type { UserDocument } from './schemas/User';

export const errors = {
  USER_NOT_FOUND: 'User not found',
};

export class UserService {
  static async findUser(userId: string, type: 'user' | 'target' = 'user') {
    const user = await User.findById(userId);
    if (user == null) {
      switch (type) {
        case 'target':
          throw HttpErrors.TARGET_NOT_FOUND;
        case 'user':
          throw new Error(errors.USER_NOT_FOUND);
      }
    }

    return user;
  }

  static async createFriendRequest(senderId: string, targetId: string) {
    const sender = await this.findUser(senderId, 'user');
    const target = await this.findUser(targetId, 'target');

    if (sender._id.equals(target._id)) {
      throw HttpErrors.SELF_FRIEND_REQUEST;
    }

    if (sender.hasFriend(target._id)) {
      throw HttpErrors.FRIEND_EXISTS;
    }

    const friendRequest = await FriendRequest.findOne({ fromId: sender._id, toId: target._id });
    if (friendRequest != null) {
      throw HttpErrors.FRIEND_REQUEST_EXISTS;
    }

    const targetFriendRequest = await target.getFriendRequestTo(sender._id);

    // check if target has pending request
    if (targetFriendRequest != null) {
      await targetFriendRequest.deleteOne();
      sender.addFriend(target._id);
      target.addFriend(sender._id);

      const createConversationData: CreateConversation = { memberIds: [senderId, targetId] };
      await ConversationService.createConversation(createConversationData);

      return null;
    } else {
      return await FriendRequest.create({
        fromId: sender.id,
        toId: target.id,
      });
    }
  }

  static async removeFriendRequest(fromId: string, toId: string) {
    const sender = await this.findUser(fromId, 'user');
    const target = await this.findUser(toId, 'target');

    const friendRequest = await FriendRequest.findOne({ fromId: sender._id, toId: target._id });
    if (friendRequest == null) {
      throw HttpErrors.FRIEND_REQUEST_NOT_FOUND;
    }

    await friendRequest.deleteOne();
  }

  static async getFriendRequests(userId: string) {
    const friendRequests = await FriendRequest.find({
      $or: [{ fromId: userId }, { toId: userId }],
    });

    return friendRequests;
  }

  static async removeFriend(sourceId: string, targetId: string) {
    const source = await this.findUser(sourceId, 'user');
    const target = await this.findUser(targetId, 'target');

    if (!source.hasFriend(target._id)) {
      throw HttpErrors.FRIEND_NOT_FOUND;
    }

    source.removeFriend(target._id);
    target.removeFriend(source._id);
  }

  static async isEmailVerified(email: string) {
    const user = await User.findOne({ email: email });
    if (user == null) {
      throw HttpErrors.EMAIL_NOT_FOUND;
    }

    return user.emailVerified;
  }

  static async isEmailTaken(email: string) {
    const user = await User.findOne({ email: email });
    return user != null;
  }

  static async isUsernameTaken(username: string) {
    const user = await User.findOne({ name: username });
    return user != null;
  }

  static async deleteUser(userId: string) {
    const user = await this.findUser(userId);
    await user.deleteOne();
  }

  static async getBasicUserInfoByName(name: string) {
    const user = await User.findOne({ name: name });
    return await this.getBasicUserInfo(user);
  }

  static async getBasicUserInfoById(userId: string) {
    const user = await User.findById(userId);
    return await this.getBasicUserInfo(user);
  }

  static getBasicUserInfo(user: UserDocument | null): Promise<BasicUserInfo> {
    if (user == null) {
      throw new Error(errors.USER_NOT_FOUND);
    }

    return {
      id: user._id.toString(),
      name: user.name,
      biography: user.biography ?? '',
      createdAt: user.createdAt ?? Date.now(),
    };
  }

  static async createKeyExchangeRequest(fromId: string, toId: string, cipher: string) {
    const sender = await this.findUser(fromId, 'user');
    const target = await this.findUser(toId, 'target');

    const keyExchangeRequest = await KeyExchangeRequest.findOne({
      $or: [
        { fromId: sender.id, toId: target.id },
        { fromId: target.id, toId: sender.id },
      ],
    });

    if (keyExchangeRequest != null) {
      throw HttpErrors.KEY_EXCHANGE_REQUEST_EXISTS;
    }

    await KeyExchangeRequest.create({
      fromId: sender.id,
      toId: target.id,
      cipher: cipher,
    });
  }

  static async findKeyExchangeRequestsTo(userId: string) {
    const user = await this.findUser(userId);

    const keyExchangeRequests = await KeyExchangeRequest.find({
      toId: user._id,
    });

    return keyExchangeRequests;
  }

  static async deleteKeyExchangeRequestsTo(userId: string) {
    const user = await this.findUser(userId);

    await KeyExchangeRequest.deleteMany({ toId: user.id });
  }
}
