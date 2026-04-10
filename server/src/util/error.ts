import { Response } from 'express';

export class HttpError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number = 500, code: string, message: string) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const handleHttpError = (error: any, res: Response) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).send({
      success: false,
      code: error.code,
      message: error.message,
    });
    return;
  }

  res.status(500).send({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Unknown Error: ' + error.message,
  });
};

export class ErrorCodes {
  static readonly ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND';
  static readonly USER_NOT_FOUND = 'USER_NOT_FOUND';
  static readonly TARGET_NOT_FOUND = 'TARGET_NOT_FOUND';
  static readonly FRIEND_NOT_FOUND = 'FRIEND_NOT_FOUND';
  static readonly EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND';
  static readonly FRIEND_REQUEST_EXISTS = 'FRIEND_REQUEST_EXISTS';
  static readonly FRIEND_REQUEST_NOT_FOUND = 'FRIEND_REQUEST_NOT_FOUND';
  static readonly FRIEND_EXISTS = 'FRIEND_EXISTS';
  static readonly SELF_FRIEND_REQUEST = 'SELF_FRIEND_REQUEST';
  static readonly CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND';
  static readonly KEY_EXCHANGE_REQUEST_EXISTS = 'KEY_EXCHANGE_REQUEST_EXISTS';
}
