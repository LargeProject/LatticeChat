import * as z from 'zod';

const sendMessage = z.object({
  conversationId: z.string().nonempty(),
  senderId: z.string().nonempty(),
  content: z.string().nonempty(),
});

export { sendMessage };
export type SendMessage = z.infer<typeof sendMessage>;
