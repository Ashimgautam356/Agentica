import { prisma } from "../prisma";

export function findSummary(sessionId: string) {
  return prisma.chatSummary.findUnique({
    where: { sessionId },
    include: { lastMessage: { select: { id: true, createdAt: true } } },
  });
}

export function saveSummary(sessionId: string, summary: string, lastMessageId: string) {
  return prisma.chatSummary.upsert({
    where: { sessionId },
    create: { sessionId, summary, lastMessageId },
    update: { summary, lastMessageId },
  });
}
