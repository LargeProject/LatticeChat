import type {Request, Response, NextFunction} from "express";

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;
export type Service = (req: Request, res: Response) => void;