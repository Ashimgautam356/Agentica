import "dotenv/config";
import { createApp } from "./app";
import { prisma } from "./prisma";
import { startSummaryWorker, stopSummaryWorker } from "./workers/summary.worker";

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Agentica Express API listening on port ${port}`);
});

startSummaryWorker();

async function shutdown(signal: string) {
  console.info(`${signal} received; shutting down`);
  const closed = new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await stopSummaryWorker();
  await closed;
  await prisma.$disconnect();
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
