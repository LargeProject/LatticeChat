import { Schema } from 'mongoose';

export const accountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});
