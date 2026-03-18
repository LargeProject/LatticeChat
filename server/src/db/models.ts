import { Model } from "mongoose";
import { UserSchema } from "./schemas/User";

export const User = new Model("User", UserSchema);
