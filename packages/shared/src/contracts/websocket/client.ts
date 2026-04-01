import * as z from 'zod';

export const sendMessage = z.object({
  conversationId: z.string().nonempty(),
  senderId: z.string().nonempty(),
  content: z.string().nonempty(),
});
export type SendMessage = z.infer<typeof sendMessage>;

export const createConversation = z.object({
  ownerId: z.string().nonempty(),
  name: z.string().nonempty(),
  memberIds: z.array(z.string().nonempty()),
});
export type CreateConversation = z.infer<typeof createConversation>;
