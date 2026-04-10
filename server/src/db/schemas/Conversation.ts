import type { Types } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import { User } from '../models';

export const messageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversationId: {
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
  keys: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      encryptedKey: {
        type: String,
      },
    },
  ],
});

export const conversationSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    isDirectMessage: {
      type: Boolean,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    memberIds: {
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
  },
  {
    methods: {
      hasMember: function (memberId: string) {
        const memberObjectId = new mongoose.Types.ObjectId(memberId);
        return this.memberIds.includes(memberObjectId);
      },
    },
  },
);

conversationSchema.pre('save', { document: true, query: true }, async function () {
  if (!this.isNew) return;

  await User.updateMany({ _id: { $in: this.memberIds } }, { $addToSet: { conversationIds: this._id } });
});

conversationSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await User.updateMany({ conversationIds: this._id }, { $pull: { conversationIds: this._id } });
});
