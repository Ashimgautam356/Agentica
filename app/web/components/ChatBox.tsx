"use client";

import { Bot, LoaderCircle, RotateCcw, Send, User } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool?: string;
};

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I’m your Agentica shopping assistant. Tell me what you’re looking for, ask about our products, or let me help you compare options.",
};

const suggestions = [
  "Show me what products are available",
  "Help me choose a product",
  "How does checkout work?",
];

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const conversation = [...messages, userMessage];

    setInput("");
    setIsLoading(true);
    setMessages(conversation);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation
            .slice(-20)
            .map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        }),
      });
      const data = (await response.json()) as { reply?: string; tool?: string; error?: string };

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.ok
            ? (data.reply ?? "I couldn’t generate a response.")
            : (data.error ?? "The assistant is temporarily unavailable."),
          tool: data.tool,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I couldn’t connect right now. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#f4f8f5] px-3 py-4 min-[921px]:min-h-[calc(100vh-6rem)] min-[700px]:px-6 min-[700px]:py-8">
      <section className="mx-auto grid h-[calc(100vh-7rem)] max-w-5xl overflow-hidden rounded-2xl border border-[#dce7e1] bg-white shadow-[0_24px_70px_rgba(9,39,68,0.10)] min-[921px]:h-[calc(100vh-10rem)]">
        <div className="grid min-w-0 grid-rows-[auto_1fr_auto] overflow-hidden">
          <header className="flex items-center justify-between border-b border-[#e6ece8] px-4 py-3 min-[640px]:px-6 min-[640px]:py-4">
            <div className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                <Bot className="h-5 w-5" />
                <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-main-green" />
              </span>
              <div>
                <h1 className="text-base font-extrabold text-text-dark">Agentica Assistant</h1>
                <p className="text-xs text-[#7c8798]">Online · powered by Groq</p>
              </div>
            </div>
            <button
              aria-label="Start a new conversation"
              className="grid h-9 w-9 place-items-center rounded-full text-[#7c8798] transition hover:bg-[#eef5f1] hover:text-text-dark"
              onClick={() => {
                setMessages([welcomeMessage]);
                setInput("");
              }}
              title="New conversation"
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </header>

          <div
            className="overflow-y-auto bg-[radial-gradient(circle_at_top,#f5fcf7_0,white_48%)] px-4 py-6 min-[640px]:px-8"
            aria-live="polite"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {messages.map((message) => (
                <article
                  className={`flex items-end gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  key={message.id}
                >
                  {message.role === "assistant" ? (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                      <Bot className="h-4 w-4" />
                    </span>
                  ) : null}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === "user"
                        ? "rounded-br-sm bg-[#092744] text-white"
                        : "rounded-bl-sm border border-[#e1e9e4] bg-white text-[#34495d]"
                    }`}
                  >
                    {message.tool ? (
                      <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-[#16a34a]">
                        Catalog checked
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" ? (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#092744] text-white">
                      <User className="h-4 w-4" />
                    </span>
                  ) : null}
                </article>
              ))}

              {messages.length === 1 ? (
                <div className="flex flex-wrap gap-2 pl-10">
                  {suggestions.map((suggestion) => (
                    <button
                      className="rounded-full border border-[#cfe0d6] bg-white px-4 py-2.5 text-xs font-bold text-[#526273] shadow-sm transition hover:border-main-green hover:bg-[#f1fbf4] hover:text-[#16a34a] disabled:opacity-50"
                      disabled={isLoading}
                      key={suggestion}
                      onClick={() => void sendMessage(suggestion)}
                      type="button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}

              {isLoading ? (
                <article className="flex items-end gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[#e1e9e4] bg-white px-4 py-3 text-sm text-[#7c8798]">
                    <LoaderCircle className="h-4 w-4 animate-spin" /> Thinking
                  </div>
                </article>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </div>

          <form
            className="border-t border-[#e6ece8] bg-white p-3 min-[640px]:p-5"
            onSubmit={submit}
          >
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-[#ccd9d2] bg-[#fbfdfc] p-2 focus-within:border-main-green focus-within:ring-3 focus-within:ring-main-green/10">
              <textarea
                aria-label="Message Agentica"
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-text-dark outline-none placeholder:text-[#9aa4b2]"
                maxLength={4000}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about products, categories, or checkout…"
                rows={1}
                value={input}
              />
              <button
                aria-label="Send message"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-main-green text-white transition hover:bg-main-green-hover disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading || !input.trim()}
                type="submit"
              >
                {isLoading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#9aa4b2]">
              AI can make mistakes. Check important product and order information.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
