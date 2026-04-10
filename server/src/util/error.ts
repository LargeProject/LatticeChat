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

export class HttpErrors {
  static readonly ACCOUNT_NOT_FOUND = new HttpError(404, 'ACCOUNT_NOT_FOUND', 'Account not found');
  static readonly USER_NOT_FOUND = new HttpError(404, 'USER_NOT_FOUND', 'User not found');
  static readonly TARGET_NOT_FOUND = new HttpError(404, 'TARGET_NOT_FOUND', 'Target not found');
  static readonly FRIEND_NOT_FOUND = new HttpError(404, 'FRIEND_NOT_FOUND', 'Friend not found');
  static readonly EMAIL_NOT_FOUND = new HttpError(404, 'EMAIL_NOT_FOUND', 'Email not found');
  static readonly FRIEND_REQUEST_EXISTS = new HttpError(409, 'FRIEND_REQUEST_EXISTS', 'Friend request already exists');
  static readonly FRIEND_REQUEST_NOT_FOUND = new HttpError(404, 'FRIEND_REQUEST_NOT_FOUND', 'Friend request not found');
  static readonly FRIEND_EXISTS = new HttpError(409, 'FRIEND_EXISTS', 'Already friends with this user');
  static readonly SELF_FRIEND_REQUEST = new HttpError(
    409,
    'SELF_FRIEND_REQUEST',
    "Friend requests to one's own account are not allowed",
  );
  static readonly CONVERSATION_NOT_FOUND = new HttpError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
  static readonly KEY_EXCHANGE_REQUEST_EXISTS = new HttpError(
    404,
    'KEY_EXCHANGE_REQUEST_EXISTS',
    'Key exchange request exists',
  );
}
