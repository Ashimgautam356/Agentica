import type { ChatMessage } from "@prisma/client";
import { generateConversationSummary } from "../providers/chat-llm.provider";
import * as messageRepository from "../repositories/chat-message.repository";
import * as summaryRepository from "../repositories/chat-summary.repository";

const SUMMARY_BATCH_CHARACTERS = 12_000;

export function formatMessages(messages: Pick<ChatMessage, "role" | "content">[]) {
  return messages.map((message) => `${message.role}: ${message.content}`).join("\n");
}

export function splitSummaryBatches(messages: ChatMessage[]) {
  const batches: ChatMessage[][] = [];
  let batch: ChatMessage[] = [];
  let characters = 0;

  for (const message of messages) {
    if (batch.length && characters + message.content.length > SUMMARY_BATCH_CHARACTERS) {
      batches.push(batch);
      batch = [];
      characters = 0;
    }
    batch.push(message);
    characters += message.content.length;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

export async function updateSummary(sessionId: string) {
  const existing = await summaryRepository.findSummary(sessionId);
  const messages = await messageRepository.findMessagesAfter(sessionId, existing?.lastMessage);
  if (!messages.length) return existing;

  console.info("Summary generation started", { sessionId, messageCount: messages.length });
  let summary = existing?.summary ?? "";

  for (const batch of splitSummaryBatches(messages)) {
    summary = await generateConversationSummary(summary, formatMessages(batch));
    await summaryRepository.saveSummary(sessionId, summary, batch.at(-1)!.id);
  }

  console.info("Summary generation completed", {
    sessionId,
    messageCount: messages.length,
    lastMessageId: messages.at(-1)!.id,
  });
  return summaryRepository.findSummary(sessionId);
}
