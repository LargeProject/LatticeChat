import { Schema } from 'mongoose';
import * as z from 'zod';
import validator from 'validator';
import { DBFieldAttribute } from '@better-auth/core/db';
import { ObjectId } from 'mongodb';
import { FriendRequest } from '../models';

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
