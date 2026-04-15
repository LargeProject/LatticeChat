import type { Response } from 'express';

export class TypeError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number = 500, code: string, message: string) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }

  public toString() {
    return `${this.code} Error: ${this.message}\n`;
  }

  public toResponseObject() {
    return {
      success: false,
      code: this.code,
      message: this.message,
    };
  }

  public handle(res: Response) {
    res.status(this.statusCode).send(this.toResponseObject());
  }
}

export class AccountNotFoundError extends TypeError {
  constructor() {
    super(404, 'ACCOUNT_NOT_FOUND', 'Account not found');
  }
}

export class UserNotFoundError extends TypeError {
  constructor() {
    super(404, `USER_NOT_FOUND`, `User not found`);
  }
}

export class TargetNotFoundError extends TypeError {
  constructor() {
    super(404, `TARGET_NOT_FOUND`, `Target not found`);
  }
}

export class FriendNotFoundError extends TypeError {
  constructor() {
    super(404, 'FRIEND_NOT_FOUND', 'Friend not found');
  }
}

export class EmailNotFoundError extends TypeError {
  constructor() {
    super(404, 'EMAIL_NOT_FOUND', 'Email not found');
  }
}

export class ConversationNotFoundError extends TypeError {
  constructor() {
    super(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
  }
}

export class FriendRequestNotFoundError extends TypeError {
  constructor() {
    super(404, 'FRIEND_REQUEST_NOT_FOUND', 'Friend request not found');
  }
}

export class FriendRequestExistsError extends TypeError {
  constructor() {
    super(409, 'FRIEND_REQUEST_EXISTS', 'Friend request already exists');
  }
}

export class FriendExistsError extends TypeError {
  constructor() {
    super(409, 'FRIEND_EXISTS', 'Already friends with this user');
  }
}

export class SelfFriendRequestError extends TypeError {
  constructor() {
    super(409, 'SELF_FRIEND_REQUEST', "Friend requests to one's own account are not allowed");
  }
}

export class DirectMessageInviteError extends TypeError {
  constructor() {
    super(403, 'DIRECT_MESSAGE_INVITE', 'Members cannot be added to a direct message');
  }
}

export class NotMemberError extends TypeError {
  constructor() {
    super(403, 'NOT_MEMBER', 'Not a member of this conversation');
  }
}

export class NotFriendsError extends TypeError {
  constructor() {
    super(403, 'NOT_FRIENDS', 'Target user is not your friend');
  }
}

export class MemberExistsError extends TypeError {
  constructor() {
    super(403, 'MEMBER_EXISTS', 'Member already exists in this conversation');
  }
}

export class InvalidTokenError extends TypeError {
  constructor() {
    super(401, 'INVALID_TOKEN', 'Invalid Token');
  }
}

export const handleHttpError = (error: any, res: Response) => {
  if (error instanceof TypeError) {
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
