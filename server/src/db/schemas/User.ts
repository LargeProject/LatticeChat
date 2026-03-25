import { Schema } from "mongoose";

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
    required: true,
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
});
