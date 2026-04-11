import * as z from 'zod';

/**
 * Basic user information returned in lists and as part of other responses
 */
export const basicUserInfo = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  biography: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
});
export type BasicUserInfo = z.infer<typeof basicUserInfo>;

/**
 * Conversation with member list hydrated
 */
export const conversation = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  ownerId: z.string().optional(),
  members: z.array(basicUserInfo),
});
export type Conversation = z.infer<typeof conversation>;

/**
 * Current user info returned by /users/me
 */
export const userInfo = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  email: z.string().email(),
  biography: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
});
export type UserInfo = z.infer<typeof userInfo>;

/**
 * Response payload for GET /users/me
 * Contains full user data with hydrated conversations and friends
 */
export const currentUserResponse = z.object({
  user: userInfo,
  conversations: z.array(conversation),
  friends: z.array(basicUserInfo),
});
export type CurrentUserResponse = z.infer<typeof currentUserResponse>;
