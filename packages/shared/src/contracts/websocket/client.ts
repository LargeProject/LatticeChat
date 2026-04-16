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

export const addMember = z.object({
  conversationId: z.string().nonempty(),
  userId: z.string().nonempty(),
});
export type AddMember = z.infer<typeof addMember>;

export const leaveConversation = z.object({
  conversationId: z.string().nonempty(),
});
export type LeaveConversation = z.infer<typeof leaveConversation>;

export const renameConversation = z.object({
  conversationId: z.string().nonempty(),
  newName: z.string().nonempty(),
});
export type RenameConversation = z.infer<typeof renameConversation>;
