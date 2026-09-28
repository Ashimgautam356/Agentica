import { ApiError } from "../errors/api-error";
import { generateAssistantReply } from "../providers/chat-llm.provider";
import * as authService from "./auth.service";
import * as messageRepository from "../repositories/chat-message.repository";
import * as sessionRepository from "../repositories/chat-session.repository";
import * as summaryRepository from "../repositories/chat-summary.repository";
import { scheduleSummaryIfNeeded } from "./summary-queue.service";
import { formatMessages } from "./summary.service";

function sessionTitle(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 120) || "New conversation";
}

export function formatConversationContext(
  summary: string,
  recentMessages: Parameters<typeof formatMessages>[0],
  currentMessage: string,
  handoffSummary = "",
  catalogContext = "",
) {
  const combinedSummary = [summary, handoffSummary].filter(Boolean).join("\n");
  return `Conversation Summary:\n${combinedSummary || "(No summary yet.)"}\n\nRecent Messages:\n${formatMessages(recentMessages) || "(None.)"}\n\nMCP Catalog Context:\n${catalogContext || "(No catalog lookup for this message.)"}\n\nCurrent Message:\nUSER: ${currentMessage}`;
}

export async function saveUserMessage(userId: string, sessionId: string, content: string) {
  await sessionRepository.ensureOwnedSession(userId, sessionId, sessionTitle(content));
  return messageRepository.createMessage(sessionId, "USER", content);
}

export function saveAssistantMessage(sessionId: string, content: string) {
  return messageRepository.createMessage(sessionId, "ASSISTANT", content);
}

export async function buildConversationContext(
  sessionId: string,
  currentMessageId?: string,
  handoffSummary?: string,
  catalogContext?: string,
) {
  const currentMessage = currentMessageId
    ? await messageRepository.findMessage(sessionId, currentMessageId)
    : await messageRepository.findLatestUserMessage(sessionId);

  if (!currentMessage || currentMessage.role !== "USER") {
    throw new ApiError("NOT_FOUND", "Current user message not found.");
  }

  const summary = await summaryRepository.findSummary(sessionId);
  const recentMessages = await messageRepository.findRecentMessages(
    sessionId,
    summary?.lastMessage,
    currentMessage,
  );
  return formatConversationContext(
    summary?.summary ?? "",
    recentMessages,
    currentMessage.content,
    handoffSummary,
    catalogContext,
  );
}

export async function sendMessage(
  userId: string,
  sessionId: string,
  content: string,
  handoffSummary?: string,
  catalogContext?: string,
) {
  const customer = await authService.getCurrentCustomer(userId);
  if (!customer.apiKey) {
    throw new ApiError("FORBIDDEN", "Generate your Agentica API key before using chat.");
  }

  const userMessage = await saveUserMessage(userId, sessionId, content);
  if (handoffSummary) {
    await messageRepository.createMessage(
      sessionId,
      "SYSTEM",
      `Conversation continued from quick chat:\n${handoffSummary}`,
    );
  }
  const context = await buildConversationContext(
    sessionId,
    userMessage.id,
    handoffSummary,
    catalogContext,
  );
  const reply = await generateAssistantReply(context);
  const assistantMessage = await saveAssistantMessage(sessionId, reply);

  try {
    await scheduleSummaryIfNeeded(sessionId);
  } catch (error) {
    console.error("Failed to enqueue conversation summary", { sessionId, error });
  }

  return { userMessage, assistantMessage };
}

export async function getConversation(userId: string, sessionId: string) {
  const session = await sessionRepository.findOwnedSessionWithHistory(userId, sessionId);
  if (!session) throw new ApiError("NOT_FOUND", "Chat session not found.");
  return session;
}

export async function getConversationSummary(userId: string, sessionId: string) {
  await sessionRepository.findOwnedSession(userId, sessionId);
  return (
    (await summaryRepository.findSummary(sessionId)) ?? {
      sessionId,
      summary: "",
      lastMessageId: null,
      updatedAt: null,
    }
  );
}
