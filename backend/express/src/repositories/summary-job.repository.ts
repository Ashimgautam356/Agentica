import { prisma } from "../prisma";

const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

export async function enqueueSummaryJob(sessionId: string) {
  const revived = await prisma.summaryUpdateJob.updateMany({
    where: { sessionId, failedAt: { not: null } },
    data: { availableAt: new Date(), lockedAt: null, attempts: 0, lastError: null, failedAt: null },
  });
  if (revived.count) return;

  try {
    await prisma.summaryUpdateJob.create({ data: { sessionId } });
  } catch (error) {
    if ((error as { code?: string }).code !== "P2002") throw error;
  }
}

export async function claimSummaryJob() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const now = new Date();
    const staleBefore = new Date(now.getTime() - LOCK_TIMEOUT_MS);
    const job = await prisma.summaryUpdateJob.findFirst({
      where: {
        availableAt: { lte: now },
        failedAt: null,
        OR: [{ lockedAt: null }, { lockedAt: { lt: staleBefore } }],
      },
      orderBy: { availableAt: "asc" },
    });
    if (!job) return null;

    const claimed = await prisma.summaryUpdateJob.updateMany({
      where: {
        id: job.id,
        OR: [{ lockedAt: job.lockedAt }, { lockedAt: null }],
      },
      data: { lockedAt: now },
    });
    if (claimed.count) return { ...job, lockedAt: now };
  }
  return null;
}

export function completeSummaryJob(id: string) {
  return prisma.summaryUpdateJob.deleteMany({ where: { id } });
}

export function failSummaryJob(id: string, attempts: number, error: string) {
  const nextAttempts = attempts + 1;
  return prisma.summaryUpdateJob.updateMany({
    where: { id },
    data: {
      attempts: nextAttempts,
      lastError: error.slice(0, 2000),
      lockedAt: null,
      availableAt: new Date(Date.now() + 2 ** Math.min(nextAttempts, 6) * 1000),
      failedAt: nextAttempts >= 5 ? new Date() : null,
    },
  });
}
