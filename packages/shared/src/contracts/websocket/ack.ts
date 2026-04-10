import * as z from 'zod';

export const ackResponse = z.object({
  success: z.boolean(),
  userId: z.string().optional(),
  error: z.string().optional(),
  code: z.string().optional(),
});

export type AckResponse = z.infer<typeof ackResponse>;
