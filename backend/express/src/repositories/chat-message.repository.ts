import type { ChatMessageRole, Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export type MessagePosition = { id: string; createdAt: Date };

function after(position?: MessagePosition | null): Prisma.ChatMessageWhereInput {
  if (!position) return {};
  return {
    OR: [
      { createdAt: { gt: position.createdAt } },
      { createdAt: position.createdAt, id: { gt: position.id } },
    ],
  };
}

function before(position?: MessagePosition | null): Prisma.ChatMessageWhereInput {
  if (!position) return {};
  return {
    OR: [
      { createdAt: { lt: position.createdAt } },
      { createdAt: position.createdAt, id: { lt: position.id } },
    ],
  };
}

export function createMessage(sessionId: string, role: ChatMessageRole, content: string) {
  return prisma.$transaction(async (transaction) => {
    const message = await transaction.chatMessage.create({ data: { sessionId, role, content } });
    await transaction.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });
    return message;
  });
}

export function findMessage(sessionId: string, id: string) {
  return prisma.chatMessage.findFirst({ where: { id, sessionId } });
}

export function findLatestUserMessage(sessionId: string) {
  return prisma.chatMessage.findFirst({
    where: { sessionId, role: "USER" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function findRecentMessages(
  sessionId: string,
  checkpoint?: MessagePosition | null,
  current?: MessagePosition | null,
  limit = 20,
) {
  const messages = await prisma.chatMessage.findMany({
    where: { sessionId, AND: [after(checkpoint), before(current)] },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });
  return messages.reverse();
}

export function findMessagesAfter(sessionId: string, checkpoint?: MessagePosition | null) {
  return prisma.chatMessage.findMany({
    where: { sessionId, ...after(checkpoint) },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
}

export function findThresholdMessages(sessionId: string, checkpoint?: MessagePosition | null) {
  return prisma.chatMessage.findMany({
    where: { sessionId, ...after(checkpoint) },
    select: { content: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: 20,
  });
}
