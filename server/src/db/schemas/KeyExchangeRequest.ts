import { Schema } from 'mongoose';

export const keyExchangeRequestSchema = new Schema({
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
  cipher: {
    type: String,
    required: true,
  },
});
