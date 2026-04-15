import type { BasicUserInfo, Conversation, CreateConversation, CurrentUserResponse } from '@latticechat/shared';
import { FriendRequest, User } from '../models';
import { ConversationService } from './ConversationService';
import {
  EmailNotFoundError,
  FriendExistsError,
  FriendNotFoundError,
  FriendRequestExistsError,
  FriendRequestNotFoundError,
  SelfFriendRequestError,
  TargetNotFoundError,
  UserNotFoundError,
} from '../../util/error';
import type { UserDocument } from '../schemas/User';
import type * as contracts from '@latticechat/shared';

export class UserService {
  static async findUser(userId: string, type: 'user' | 'target' = 'user') {
    const user = await User.findById(userId);
    if (user == null) {
      switch (type) {
        case 'target':
          throw new UserNotFoundError();
        case 'user':
          throw new TargetNotFoundError();
      }
    }

    return user;
  }

  static async findHydratedUser(userId: string): Promise<CurrentUserResponse> {
    const user = await this.findUser(userId);

    const conversations: Conversation[] = await user.getHydratedConversations();
    const friends: BasicUserInfo[] = await user.getFriends();

    const response: contracts.CurrentUserResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        biography: user.biography,
        createdAt: user.createdAt,
      },
      conversations: conversations,
      friends: friends,
    };

    return response;
  }

  static async acceptFriendRequest(senderId: string, targetId: string) {
    const sender = await this.findUser(senderId, 'user');
    const target = await this.findUser(targetId, 'target');

    const friendRequest = await sender.getFriendRequestTo(target._id);
    if (friendRequest == null) {
      throw new FriendRequestNotFoundError();
    }

    await friendRequest.deleteOne();
    sender.addFriend(target._id);
    target.addFriend(sender._id);

    const createConversationData: CreateConversation = { memberIds: [senderId, targetId] };
    await ConversationService.createConversation(createConversationData, true);
  }

  static async createFriendRequest(senderId: string, targetId: string) {
    const sender = await this.findUser(senderId, 'user');
    const target = await this.findUser(targetId, 'target');

    if (sender._id.equals(target._id)) {
      throw new SelfFriendRequestError();
    }

    if (sender.hasFriend(target._id)) {
      throw new FriendExistsError();
    }

    const friendRequest = await FriendRequest.findOne({
      $or: [
        { fromId: sender._id, toId: target._id },
        { fromId: target._id, toId: sender._id },
      ],
    });
    if (friendRequest != null) {
      throw new FriendRequestExistsError();
    }

    return await FriendRequest.create({
      fromId: sender.id,
      toId: target.id,
    });
  }

  static async removeFriendRequest(fromId: string, toId: string) {
    const sender = await this.findUser(fromId, 'user');
    const target = await this.findUser(toId, 'target');

    const friendRequest = await FriendRequest.findOne({
      $or: [
        { fromId: sender._id, toId: target._id },
        { fromId: target._id, toId: sender._id },
      ],
    });
    if (friendRequest == null) {
      throw new FriendRequestNotFoundError();
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
      throw new FriendNotFoundError();
    }

    source.removeFriend(target._id);
    target.removeFriend(source._id);
  }

  static async isEmailVerified(email: string) {
    const user = await User.findOne({ email: email });
    if (user == null) {
      throw new EmailNotFoundError();
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
    return this.getBasicUserInfo(user);
  }

  static async getBasicUserInfoById(userId: string) {
    const user = await User.findById(userId);
    return this.getBasicUserInfo(user);
  }

  static async getBasicUserInfosById(userIds: string[]): Promise<UserDocument[]> {
    return (await User.find({ _id: { $in: userIds } })) ?? [];
  }

  static getBasicUserInfo(user: UserDocument | null) {
    if (user == null) {
      throw new UserNotFoundError();
    }

    return {
      id: user._id.toString(),
      name: user.name,
      biography: user.biography ?? '',
      createdAt: user.createdAt ?? Date.now(),
    };
  }
}
