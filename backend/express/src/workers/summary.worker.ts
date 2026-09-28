import * as jobRepository from "../repositories/summary-job.repository";
import { scheduleSummaryIfNeeded, SUMMARY_UPDATE_JOB } from "../services/summary-queue.service";
import { updateSummary } from "../services/summary.service";

const POLL_INTERVAL_MS = Number(process.env.SUMMARY_WORKER_POLL_MS ?? 5000);
let timer: NodeJS.Timeout | undefined;
let activeRun: Promise<void> | undefined;

async function drainQueue() {
  if (activeRun) return activeRun;

  activeRun = (async () => {
    while (true) {
      const job = await jobRepository.claimSummaryJob();
      if (!job) break;

      try {
        await updateSummary(job.sessionId);
        await jobRepository.completeSummaryJob(job.id);
        await scheduleSummaryIfNeeded(job.sessionId);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Summary job failed", {
          job: SUMMARY_UPDATE_JOB,
          jobId: job.id,
          sessionId: job.sessionId,
          attempt: job.attempts + 1,
          error: message,
        });
        await jobRepository.failSummaryJob(job.id, job.attempts, message);
      }
    }
  })().finally(() => {
    activeRun = undefined;
  });

  return activeRun;
}

export function startSummaryWorker() {
  if (timer || process.env.DISABLE_SUMMARY_WORKER === "true") return;
  void drainQueue().catch((error) => console.error("Summary worker poll failed", error));
  timer = setInterval(() => {
    void drainQueue().catch((error) => console.error("Summary worker poll failed", error));
  }, POLL_INTERVAL_MS);
  timer.unref();
}

export async function stopSummaryWorker() {
  if (timer) clearInterval(timer);
  timer = undefined;
  await activeRun;
}
