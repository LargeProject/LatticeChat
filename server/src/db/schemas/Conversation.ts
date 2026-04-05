import { Schema, Types } from 'mongoose';
import { User } from '../models';

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
    required: false,
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

conversationSchema.pre(
  'save',
  { document: true, query: true },
  async function () {
    if (!this.isNew) return;

    await User.updateMany(
      { _id: { $in: this.members } },
      { $addToSet: { conversations: this._id } },
    );
  },
);

conversationSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function () {
    await User.updateMany(
      { conversations: this._id },
      { $pull: { conversations: this._id } },
    );
  },
);
