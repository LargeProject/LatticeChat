import type {Request, Response, NextFunction} from "express";

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;
export type Service = (req: Request, res: Response) => void;

// TODO: specify "userSessionInfo" properties when UserSchema is complete
export type UserRequest = Request & {userSessionInfo?: any}