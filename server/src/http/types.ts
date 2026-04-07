import type { Request, Response, NextFunction } from 'express';

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;
export type Service = (req: Request, res: Response) => void;

// TODO: expand when all user fields are determined
export type UserRequest = Request & { userInfo?: any };

// TODO: create type in shared directory
export type BasicUserInfo = {
  id: string;
  username: string,
  displayUsername: string;
  biography: string;
  createdAt: Date;
};
