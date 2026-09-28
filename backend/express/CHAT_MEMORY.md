# Level 2 conversation summary memory

The Express API owns chat persistence and sends the LLM a compact context: the durable summary, at most 20 messages newer than its checkpoint, and the current user message. The current message is intentionally excluded from the recent-message block.

## Components

- `prisma/schema.prisma` defines sessions, messages, one summary per session, and the durable summary-job queue. Foreign keys cascade when a user or chat session is deleted.
- `repositories/chat-*.repository.ts` contain database access and deterministic message ordering by `created_at` plus UUID.
- `services/chat.service.ts` saves both sides of a conversation, builds LLM context, verifies session ownership, and returns full history.
- `services/summary.service.ts` folds unsummarized messages into the existing summary. Large backlogs are processed in bounded batches and each successful checkpoint is persisted, so a retry resumes without repeating completed work.
- `services/summary-queue.service.ts` enqueues `SUMMARY_UPDATE_JOB` when 20 unsummarized messages exist or their content reaches 10,000 characters.
- `workers/summary.worker.ts` polls the PostgreSQL-backed queue, claims jobs with an atomic compare-and-swap, retries failures with exponential backoff, and dead-letters after five failures. Locks older than five minutes are recoverable after a crash.
- `providers/chat-llm.provider.ts` calls Groq with separate system instructions for assistant replies and summaries, a 30-second default timeout, and safe upstream errors.
- `controllers/chat.controller.ts` and `routes/public.router.ts` expose authenticated customer endpoints.

## API

All routes require the existing customer bearer token/cookie or `x-api-key`.

```text
POST /api/chat/:sessionId/message  { "content": "..." }
GET  /api/chat/:sessionId
GET  /api/chat/:sessionId/summary
```

The client creates a UUID for a new conversation. The first POST associates that session with the authenticated customer; later access by another customer returns 404.

The storefront keeps the active UUID in customer-scoped local storage, restores its full history through the Next.js `/api/chat` proxy, and sends only the current message. The proxy forwards authentication and retains MCP product previews.

## Configuration

```dotenv
GROQ_API_KEY=...
GROQ_MODEL=openai/gpt-oss-20b
LLM_TIMEOUT_MS=30000
SUMMARY_WORKER_POLL_MS=5000
DISABLE_SUMMARY_WORKER=false
```

Run `pnpm db:push` after changing the schema. The worker starts with the normal long-running API process; set `DISABLE_SUMMARY_WORKER=true` only when a separate process owns queue consumption.
