import { Schema } from 'mongoose';

export const accountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    publicKey: {
      type: String,
      required: false,
    },
  },
  {
    methods: {
      setPublicKey: function (publicKey: string) {
        this.publicKey = publicKey;
        this.save();
      },
    },
  },
);
