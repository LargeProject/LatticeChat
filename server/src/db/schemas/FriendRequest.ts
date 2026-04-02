import { Schema } from "mongoose";

export const friendRequestSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

friendRequestSchema.index({ from: 1, to: 1 }, {unique: true});