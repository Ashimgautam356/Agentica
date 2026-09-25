import * as messageRepository from "../repositories/chat-message.repository";
import * as summaryRepository from "../repositories/chat-summary.repository";
import * as jobRepository from "../repositories/summary-job.repository";

export const SUMMARY_UPDATE_JOB = "SUMMARY_UPDATE_JOB";
export const SUMMARY_MESSAGE_THRESHOLD = 20;
export const SUMMARY_CHARACTER_THRESHOLD = 10_000;

export function thresholdReached(messages: Array<{ content: string }>) {
  return (
    messages.length >= SUMMARY_MESSAGE_THRESHOLD ||
    messages.reduce((total, message) => total + message.content.length, 0) >=
      SUMMARY_CHARACTER_THRESHOLD
  );
}

export async function scheduleSummaryIfNeeded(sessionId: string) {
  const currentSummary = await summaryRepository.findSummary(sessionId);
  const messages = await messageRepository.findThresholdMessages(
    sessionId,
    currentSummary?.lastMessage,
  );

  if (!thresholdReached(messages)) return false;
  await jobRepository.enqueueSummaryJob(sessionId);
  return true;
}
