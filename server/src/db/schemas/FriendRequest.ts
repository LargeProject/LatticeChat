import { Schema } from 'mongoose';

export const friendRequestSchema = new Schema({
  fromId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

friendRequestSchema.index({ fromId: 1, toId: 1 }, { unique: true });
