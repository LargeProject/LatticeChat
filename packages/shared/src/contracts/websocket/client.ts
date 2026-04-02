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

export const removePrivateConversation = z.object({
  memberIds: z.tuple([z.string().nonempty(), z.string().nonempty()]),
});
export type RemovePrivateConversation = z.infer<
  typeof removePrivateConversation
>;
