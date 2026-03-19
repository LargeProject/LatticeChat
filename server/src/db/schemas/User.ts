import { Schema } from "mongoose";

export const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  displayUsername: {
    type: String,
    required: false,
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
  phone: {
    type: String,
    required: true,
    unique: true,
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
  },
});
