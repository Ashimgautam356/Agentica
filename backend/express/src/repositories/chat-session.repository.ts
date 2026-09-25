import { ApiError } from "../errors/api-error";
import { prisma } from "../prisma";

export async function ensureOwnedSession(userId: string, sessionId: string, title: string) {
  const existing = await prisma.chatSession.findUnique({ where: { id: sessionId } });

  if (existing) {
    if (existing.userId !== userId) throw new ApiError("NOT_FOUND", "Chat session not found.");
    return existing;
  }

  try {
    return await prisma.chatSession.create({ data: { id: sessionId, userId, title } });
  } catch (error) {
    const raced = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (raced?.userId === userId) return raced;
    if (raced) throw new ApiError("NOT_FOUND", "Chat session not found.");
    throw error;
  }
}

export async function findOwnedSession(userId: string, sessionId: string) {
  const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw new ApiError("NOT_FOUND", "Chat session not found.");
  return session;
}

export function findOwnedSessionWithHistory(userId: string, sessionId: string) {
  return prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      summary: true,
      messages: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
    },
  });
}
