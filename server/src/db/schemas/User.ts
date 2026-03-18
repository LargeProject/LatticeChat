import { Schema } from "mongoose";

export const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    required: true,
    unique: true,
    default: false
  },
  createdAt: {
    type: Date,
    require: true,
    unique: true,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    require: true,
    unique: true,
    default: Date.now()
  }
});