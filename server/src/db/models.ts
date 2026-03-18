import { Model } from "mongoose";
import { UserSchema } from "./schemas/User.js";

export const User = new Model("user", UserSchema);