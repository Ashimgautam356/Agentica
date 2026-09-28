"use client";

import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  CHAT_HANDOFF_STORAGE_KEY,
  type ChatHandoff,
  type ConversationMessage,
} from "@/utils/chat/types";

const STORAGE_KEY = "agentica_chat_preview";
const ACTIVE_SESSION_KEY = "agentica_chat_preview_active";
const MESSAGE_LIMIT = 5;
const welcomeMessage: ConversationMessage = {
  role: "assistant",
  content: "Hi! What can I help you find today?",
};

function readStoredMessages() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    if (
      Array.isArray(value) &&
      value.every(
        (message) =>
          message &&
          typeof message === "object" &&
          ((message as ConversationMessage).role === "user" ||
            (message as ConversationMessage).role === "assistant") &&
          typeof (message as ConversationMessage).content === "string",
      )
    ) {
      return value as ConversationMessage[];
    }
  } catch {}

  return [];
}

export function FloatingChat() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([welcomeMessage]);
  const customer = useAuthStore((state) => state.customer);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readStoredMessages();
    const frame = stored.length ? window.requestAnimationFrame(() => setMessages(stored)) : 0;
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (pathname === "/chat") return null;

  const userMessageCount = messages.filter((message) => message.role === "user").length;

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    const isNewBrowserSession = !window.sessionStorage.getItem(ACTIVE_SESSION_KEY);
    if (!isNewBrowserSession && userMessageCount >= MESSAGE_LIMIT) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/chat/preview", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: messages.slice(-10) }),
        });
        const data = (await response.json()) as { summary?: string; error?: string };
        if (!response.ok || !data.summary) {
          throw new Error(data.error ?? "The conversation could not be summarized.");
        }
        const handoff: ChatHandoff = { summary: data.summary, message: content };
        window.localStorage.setItem(CHAT_HANDOFF_STORAGE_KEY, JSON.stringify(handoff));
        router.push("/chat");
      } catch (error) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              error instanceof Error
                ? error.message
                : "I couldn’t prepare the full chat. Please try again.",
          },
        ]);
        setIsLoading(false);
      }
      return;
    }

    const currentMessages = isNewBrowserSession ? [welcomeMessage] : messages;
    const nextMessages = [...currentMessages, { role: "user" as const, content }];

    if (isNewBrowserSession) window.sessionStorage.setItem(ACTIVE_SESSION_KEY, "1");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMessages));
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10) }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      const withReply = [
        ...nextMessages,
        {
          role: "assistant" as const,
          content: response.ok
            ? (data.reply ?? "I couldn’t generate a response.")
            : (data.error ?? "The assistant is temporarily unavailable."),
        },
      ];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withReply));
      setMessages(withReply);
    } catch {
      const withError = [
        ...nextMessages,
        {
          role: "assistant" as const,
          content: "I couldn’t connect right now. Please try again.",
        },
      ];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withError));
      setMessages(withError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-80 min-[640px]:right-6 min-[640px]:bottom-6">
      {isOpen ? (
        <section
          aria-label="Agentica chat assistant"
          className="mb-3 grid h-[min(34rem,calc(100dvh-7rem))] w-[calc(100vw-2rem)] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-[#dce7e1] bg-white shadow-[0_24px_70px_rgba(9,39,68,0.22)] min-[440px]:w-96"
        >
          <header className="flex items-center justify-between border-b border-[#e6ece8] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                <Bot className="h-5 w-5" />
                <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-main-green" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-text-dark">Agentica Assistant</h2>
                <p className="text-xs text-[#7c8798]">Quick shopping help</p>
              </div>
            </div>
            <button
              aria-label="Close chat"
              className="grid h-9 w-9 place-items-center rounded-full text-[#7c8798] hover:bg-[#eef5f1] hover:text-text-dark"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div
            className="overflow-y-auto bg-[radial-gradient(circle_at_top,#f5fcf7_0,white_55%)] px-4 py-5"
            aria-live="polite"
          >
            <div className="flex flex-col gap-3">
              {messages.map((message, index) => (
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                    message.role === "user"
                      ? "ml-auto rounded-br-sm bg-[#092744] text-white"
                      : "rounded-bl-sm border border-[#e1e9e4] bg-white text-[#34495d]"
                  }`}
                  key={`${message.role}-${index}`}
                >
                  {message.content}
                </div>
              ))}
              {isLoading ? (
                <div className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-sm border border-[#e1e9e4] bg-white px-3.5 py-2.5 text-sm text-[#7c8798]">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  {userMessageCount >= MESSAGE_LIMIT ? "Preparing full chat" : "Thinking"}
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </div>

          <form className="border-t border-[#e6ece8] bg-white p-3" onSubmit={sendMessage}>
            {userMessageCount >= MESSAGE_LIMIT ? (
              <p className="mb-2 text-center text-xs font-semibold text-[#526273]">
                Quick-chat limit reached. Send once more to continue in full chat.
              </p>
            ) : null}
            <div className="flex items-end gap-2 rounded-xl border border-[#ccd9d2] bg-[#fbfdfc] p-1.5 focus-within:border-main-green">
              <textarea
                aria-label="Message Agentica"
                className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-text-dark outline-none placeholder:text-[#9aa4b2]"
                disabled={isLoading}
                maxLength={1000}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={
                  userMessageCount >= MESSAGE_LIMIT
                    ? "Continue in full chat…"
                    : "Ask a quick question…"
                }
                rows={1}
                value={input}
              />
              <button
                aria-label="Send message"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-main-green text-white hover:bg-main-green-hover disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading || !input.trim()}
                type="submit"
              >
                {isLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#9aa4b2]">
              Stored only in this browser. AI can make mistakes.
            </p>
          </form>
        </section>
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-label={customer ? "Open full chat" : isOpen ? "Close chat" : "Open chat"}
        className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-main-green text-white shadow-[0_12px_30px_rgba(53,220,99,0.4)] hover:bg-main-green-hover"
        onClick={() => (customer ? router.push("/chat") : setIsOpen((open) => !open))}
        type="button"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
