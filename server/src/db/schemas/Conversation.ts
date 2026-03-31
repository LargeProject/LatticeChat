import { Schema, Types } from 'mongoose';

export const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  content: {
    type: String,
    required: true,
    minLength: 1,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export const conversationSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  members: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    validate: {
      // Ensure conversations always have atleast two members
      validator: (v: Types.ObjectId[]) => {
        return v && v.length >= 2;
      },
      message: 'A conversation must have at least two members',
    },
  },
});
