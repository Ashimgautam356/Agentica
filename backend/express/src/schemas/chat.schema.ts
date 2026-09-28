import { z } from "zod";

export const chatSessionParamsSchema = z.object({ sessionId: z.uuid() });

export const sendChatMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  handoffSummary: z.string().trim().min(1).max(4000).optional(),
  catalogContext: z.string().trim().min(1).max(12000).optional(),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
