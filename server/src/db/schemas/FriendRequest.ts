import {HydratedDocument, InferSchemaType, Schema} from "mongoose";
import { User } from "../models";

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

// remove connections from "from" and "to" users
friendRequestSchema.pre("deleteOne", { document: true, query: false }, async function() {
  const senderId = this.from._id;
  const targetId = this.to._id;

  await User.updateOne(
    {_id: senderId },
    { $pull: { outgoingFriendRequests: this._id }}
  )

  await User.updateOne(
    {_id: targetId },
    { $pull: { incomingFriendRequests: this._id }}
  )
});

// add connections to "from" and "to" users
friendRequestSchema.post("save", { document: true, query: false }, async function() {
  if(this.isNew) return;

  await User.updateOne(
    {_id: this.from._id},
    { $addToSet: { outgoingFriendRequests: this._id }}
  );

  await User.updateOne(
    {_id: this.to._id},
    { $addToSet: { incomingFriendRequests: this._id }}
  );
});

friendRequestSchema.index({ from: 1, to: 1 }, {unique: true});

export type FriendRequestType = InferSchemaType<typeof friendRequestSchema>;
export type FriendRequestDocument = HydratedDocument<FriendRequestType>;