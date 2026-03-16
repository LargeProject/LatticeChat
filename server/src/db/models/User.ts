import mongoose, { Schema } from "mongoose";
import {boolean} from "better-auth";

const UserSchema = new Schema({
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
    type: boolean,
    required: true,
    unique: true,
    default: false
  }
});

const User = mongoose.model("users", UserSchema);
export default User;
