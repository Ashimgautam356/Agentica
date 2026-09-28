import assert from "node:assert/strict";
import test from "node:test";
import { formatConversationContext } from "./chat.service";
import {
  SUMMARY_CHARACTER_THRESHOLD,
  SUMMARY_MESSAGE_THRESHOLD,
  thresholdReached,
} from "./summary-queue.service";

test("conversation context separates memory, recent history, and the current message", () => {
  const context = formatConversationContext(
    "- Budget is $1,000.",
    [
      {
        role: "ASSISTANT",
        content: "Do you prefer Lenovo or ASUS?",
      },
    ],
    "ASUS, with at least 16GB RAM.",
  );

  assert.match(context, /Conversation Summary:\n- Budget is \$1,000\./);
  assert.match(context, /Recent Messages:\nASSISTANT: Do you prefer Lenovo or ASUS\?/);
  assert.match(context, /Current Message:\nUSER: ASUS, with at least 16GB RAM\.$/);
});

test("quick-chat handoff is included in the full conversation context", () => {
  const context = formatConversationContext(
    "",
    [],
    "Show me the lighter one.",
    "User needs shoes under Rs 5,000.",
  );

  assert.match(context, /Conversation Summary:\nUser needs shoes under Rs 5,000\./);
  assert.match(context, /Current Message:\nUSER: Show me the lighter one\.$/);
});

test("MCP catalog results are included in the assistant context", () => {
  const context = formatConversationContext(
    "",
    [],
    "Show me available products.",
    "",
    "- Plant — Rs 420",
  );

  assert.match(context, /MCP Catalog Context:\n- Plant — Rs 420/);
  assert.match(context, /Current Message:\nUSER: Show me available products\.$/);
});

test("summary jobs trigger at either configured threshold", () => {
  assert.equal(
    thresholdReached(Array.from({ length: SUMMARY_MESSAGE_THRESHOLD }, () => ({ content: "x" }))),
    true,
  );
  assert.equal(thresholdReached([{ content: "x".repeat(SUMMARY_CHARACTER_THRESHOLD) }]), true);
  assert.equal(thresholdReached([{ content: "short" }]), false);
});
