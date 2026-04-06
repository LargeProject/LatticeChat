import { Response } from 'express';

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const handleHttpError = (error: any, res: Response) => {
  if (error instanceof HttpError) {
    res
      .status(error.statusCode)
      .send({ success: false, message: error.message });
    return;
  }

  res
    .status(500)
    .send({ success: false, message: 'Unknown Error: ' + error.message });
};
