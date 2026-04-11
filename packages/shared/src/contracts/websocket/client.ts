import * as z from 'zod';

export const createMessage = z.object({
  conversationId: z.string().nonempty(),
  senderId: z.string().nonempty(),
  content: z.string().nonempty(),
});
export type CreateMessage = z.infer<typeof createMessage>;

export const createConversation = z.object({
  ownerId: z.string().nonempty().optional(),
  name: z.string().nonempty().optional(),
  memberIds: z.array(z.string().nonempty()),
});
export type CreateConversation = z.infer<typeof createConversation>;

export const initHandshake = z.object({
  jwt: z.string().nonempty(),
  id: z.string().nonempty(),
});
export type InitHandshake = z.infer<typeof initHandshake>;

export const removePrivateConversation = z.object({
  memberIds: z.tuple([z.string().nonempty(), z.string().nonempty()]),
});
export type RemovePrivateConversation = z.infer<
  typeof removePrivateConversation
>;

// Client -> Server: add a member to a conversation (single member at a time)
export const addMember = z.object({
  conversationId: z.string().nonempty(),
  userId: z.string().nonempty(),
});
export type AddMember = z.infer<typeof addMember>;
