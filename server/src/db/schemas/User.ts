import { Schema, InferSchemaType, HydratedDocument } from 'mongoose';
import * as z from 'zod';
import validator from 'validator';
import { DBFieldAttribute } from '@better-auth/core/db';
import { ObjectId } from 'mongodb';
import { Account, Conversation, FriendRequest, User } from '../models';

export const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    displayUsername: {
      type: String,
      required: false,
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
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    conversations: [
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
        this.friends.push(friendId);
        this.save();
      },
      removeFriend: function (targetFriendId: ObjectId) {
        this.friends = this.friends.filter(
          (friendId) => !friendId.equals(targetFriendId),
        );
        this.save();
      },
      hasFriend: function (targetFriendId: ObjectId) {
        return this.friends.some((friendId) => friendId.equals(targetFriendId));
      },
      getFriendRequestTo: function (targetId: ObjectId) {
        return FriendRequest.findOne({
          from: this._id,
          to: targetId._id,
        });
      },
    },
  },
);

type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

userSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function () {
    // remove account
    await Account.deleteOne({
      userId: this._id,
    });

    // remove this user from all users friends list
    await User.updateMany(
      { friends: this._id },
      { $pull: { friends: this._id } },
    );

    // delete all friend requests associated connected to this user
    await FriendRequest.deleteMany({
      $or: [{ from: this._id }, { to: this._id }],
    });

    // delete all private conversations that only have this user
    await Conversation.deleteMany({
      members: {
        $all: [this._id],
      },
      owner: null,
    });

    // remove this user from all conversations that include them
    await Conversation.updateMany(
      { members: this._id },
      { $pull: { members: this._id } },
    );
  },
);

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
  friends: {
    type: 'string[]',
    input: false,
    defaultValue: [],
  },
  conversations: {
    type: 'string[]',
    input: false,
    defaultValue: [],
  },
};
