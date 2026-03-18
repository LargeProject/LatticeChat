import { Model } from "mongoose";
import { UserSchema } from "./schemas/User";

export const User = new Model("user", UserSchema);
