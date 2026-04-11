import { Schema, InferSchemaType, HydratedDocument } from 'mongoose';
import * as z from 'zod';
import validator from 'validator';
import { DBFieldAttribute } from '@better-auth/core/db';
import { ObjectId } from 'mongodb';
import { Account, Conversation, FriendRequest, User } from '../models';
import { AccountNotFoundError } from '../../util/error';
import { ConversationService } from '../services/ConversationService';
import { UserService } from '../services/UserService';
import { BasicUserInfo } from '@latticechat/shared';
import { Conversation as SharedConversation } from '@latticechat/shared';

export const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    phone: {
      type: String,
      required: false,
    },
    biography: {
      type: String,
      required: false,
    },
    friendIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    conversationIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
      },
    ],
    createdAt: {
      type: Date,
      require: true,
      unique: true,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      require: true,
      unique: true,
      default: Date.now,
    },
  },
  {
    methods: {
      addFriend: function (friendId: ObjectId) {
        this.friendIds.push(friendId);
        this.save();
      },
      removeFriend: function (targetFriendId: ObjectId) {
        this.friendIds = this.friendIds.filter((friendId) => !friendId.equals(targetFriendId));
        this.save();
      },
      hasFriend: function (targetFriendId: ObjectId) {
        return (this.friendIds || []).some((friendId) => friendId.equals(targetFriendId));
      },
      getFriendRequestTo: function (targetId: ObjectId) {
        return FriendRequest.findOne({
          fromId: this._id,
          toId: targetId._id,
        });
      },
      getAccount: async function () {
        const account = await Account.findOne({
          userId: this._id,
        });

        if (account == null) {
          throw new AccountNotFoundError();
        }

        return account;
      },
      getConversations: async function () {
        const stringConversationIds = this.conversationIds.map((conversationId) => conversationId.toString());
        const conversations = await ConversationService.findConversations(stringConversationIds);
        return conversations;
      },
      getHydratedConversations: async function () {
        const conversations = await this.getConversations();
        const hydratedConversations: SharedConversation[] = [];
        for (const conversation of conversations) {
          const hydratedConversation: SharedConversation = {
            id: conversation.id,
            name: conversation.name ?? '',
            isDirectMessage: conversation.isDirectMessage,
            ownerId: conversation?.ownerId?.toString() ?? '',
            members: await conversation.getMembers(),
          };
          hydratedConversations.push(hydratedConversation);
        }
        return hydratedConversations;
      },
      getConversationsBySearch: async function (search: string) {
        const conversations: SharedConversation[] = await this.getHydratedConversations();
        const filteredConversations = conversations.filter((conversation) => {
          if (conversation.isDirectMessage) {
            const otherMember = conversation.members.filter((member) => member.id != this.id);
            return otherMember[0]?.name.includes(search) ?? false;
          } else {
            return conversation?.name?.includes(search) ?? false;
          }
        });
        return filteredConversations;
      },
      getFriends: async function (): Promise<BasicUserInfo[]> {
        const stringFriendIds = this.friendIds.map((friendId) => friendId.toString());
        const friends = await UserService.getBasicUserInfosById(stringFriendIds);
        return friends.map((friend) => {
          return {
            id: friend._id.toString(),
            name: friend.name,
            biography: friend.biography,
            createdAt: friend.createdAt,
          };
        });
      },
    },
  },
);

type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

userSchema.pre('deleteOne', { document: true, query: false }, async function () {
  // remove account
  await Account.deleteOne({
    userId: this._id,
  });

  // remove this user from all users friends list
  await User.updateMany({ friendIds: this._id }, { $pull: { friendIds: this._id } });

  // delete all friend requests associated connected to this user
  await FriendRequest.deleteMany({
    $or: [{ fromId: this._id }, { toId: this._id }],
  });

  // delete all private conversations that only have this user
  await Conversation.deleteMany({
    memberIds: {
      $all: [this._id],
    },
    ownerId: null,
  });

  // Delete all direct messages
  await Conversation.deleteMany({ memberIds: this._id, isDirectMessage: true }, { $pull: { memberIds: this._id } });

  // remove this user from all conversations that include them
  await Conversation.updateMany({ memberIds: this._id }, { $pull: { memberIds: this._id } });
});

type UserAdditionalFields = {
  [x: string]: DBFieldAttribute;
};
export const authUserAdditionalFields: UserAdditionalFields = {
  phone: {
    type: 'string',
    required: false,
    input: true,
    validator: {
      input: z.string().refine(validator.isMobilePhone),
    },
  },
  biography: {
    type: 'string',
    required: false,
    input: true,
  },
  friendIds: {
    type: 'string[]',
    input: false,
    defaultValue: [],
  },
  conversationIds: {
    type: 'string[]',
    input: false,
    defaultValue: [],
  },
};
