import * as z from 'zod';

export const emitMessage = z.object({
  id: z.string().nonempty(),
  conversationId: z.string().nonempty(),
  senderId: z.string().nonempty(),
  content: z.string().nonempty(),
  createdAt: z.date(),
});
export type EmitMessage = z.infer<typeof emitMessage>;

export const emitMemberAdded = z.object({
  conversationId: z.string().nonempty(),
  userId: z.string().nonempty(),
  addedBy: z.string().nonempty(),
  addedAt: z.date(),
});
export type EmitMemberAdded = z.infer<typeof emitMemberAdded>;

export const emitMemberLeft = z.object({
  conversationId: z.string().nonempty(),
  userId: z.string().nonempty(),
  leftAt: z.date(),
  newOwnerId: z.string().optional(),
});
export type EmitMemberLeft = z.infer<typeof emitMemberLeft>;
