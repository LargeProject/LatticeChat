import * as z from 'zod';

export const emitMessage = z.object({
  id: z.string().nonempty(),
  conversationId: z.string().nonempty(),
  senderId: z.string().nonempty(),
  content: z.string().nonempty(),
  createdAt: z.date(),
});
export type EmitMessage = z.infer<typeof emitMessage>;
