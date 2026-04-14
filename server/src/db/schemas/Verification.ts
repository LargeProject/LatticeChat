import { Schema } from 'mongoose';

export const verificationSchema = new Schema(
  {
    identifier: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  { collection: 'verification' },
);
