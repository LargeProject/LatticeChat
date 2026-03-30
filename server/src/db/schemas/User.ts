import {HydratedDocument, InferSchemaType, Schema} from "mongoose";
import * as z from "zod";
import validator from "validator";
import { DBFieldAttribute } from "@better-auth/core/db";
import {ObjectId} from "mongodb";

export const userSchema = new Schema({
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
      ref: "User",
    }
  ],
  outgoingFriendRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: "FriendRequest",
    }
  ],
  incomingFriendRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: "FriendRequest",
    }
  ],
  conversations: [
    {
      type: Schema.Types.ObjectId,
      ref: "Conversation"
    }
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
}, {
  methods: {
    addFriend: function(friendId: ObjectId) {
      this.friends.push(friendId);
      this.save();
    },
    hasFriend: function(targetFriendId: ObjectId) {
      return this.friends.some(friendId => friendId.equals(targetFriendId));
    }
  }
});

type UserAdditionalFields = { [x: string]: DBFieldAttribute & { default?: any }; }
export const authUserAdditionalFields: UserAdditionalFields = {
  phone: {
    type: "string",
    required: false,
    input: true,
    validator: {
      input: z.string().refine(validator.isMobilePhone),
    },
  },
  biography: {
    type: "string",
    required: false,
    input: true,
  },
  friends: {
    type: "string",
    input: false,
    default: [],
  },
  outgoingFriendRequests: {
    type: "string",
    input: false,
    default: [],
  },
  incomingFriendRequests: {
    type: "string",
    input: false,
    default: [],
  },
  conversations: {
    type: "string",
    input: false,
    default: [],
  },
}

export type UserType = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserType>;
