"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
  tool?: string;
};

const welcomeMessage: Message = {
  role: "assistant",
  text: "Welcome to Agentica. Tell me what you are shopping for, or ask me to help narrow things down.",
};

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();
    if (!text || isLoading) {
      return;
    }

    setInput("");
    setIsLoading(true);
    setMessages((current) => [...current, { role: "user", text }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await response.json()) as { reply?: string; tool?: string; error?: string };

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: response.ok ? (data.reply ?? "No response.") : (data.error ?? "Request failed."),
          tool: data.tool,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Could not reach the local chat API.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="grid h-[min(760px,calc(100vh-64px))] w-full max-w-3xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      <header className="border-b border-neutral-200 p-6">
        <p className="mb-2 text-xs font-bold uppercase text-teal-700">Agentica MCP</p>
        <h1 className="text-2xl font-semibold text-neutral-950">Welcome to Agentica</h1>
      </header>

      <div className="flex flex-col gap-3 overflow-y-auto p-5" aria-live="polite">
        {messages.map((message, index) => (
          <article
            className={`max-w-[92%] rounded-lg border px-4 py-3 text-sm leading-6 ${
              message.role === "user"
                ? "self-end border-teal-700 bg-teal-50 text-neutral-950"
                : "self-start border-neutral-200 bg-neutral-50 text-neutral-900"
            }`}
            key={`${message.role}-${index}`}
          >
            {message.tool ? (
              <p className="mb-1 text-xs font-bold text-neutral-500">{message.tool}</p>
            ) : null}
            <p className="whitespace-pre-wrap">{message.text}</p>
          </article>
        ))}
        {isLoading ? (
          <article className="self-start rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900">
            Thinking...
          </article>
        ) : null}
      </div>

      <form
        className="grid grid-cols-[1fr_auto] gap-3 border-t border-neutral-200 p-4 max-sm:grid-cols-1"
        onSubmit={submit}
      >
        <input
          aria-label="Chat message"
          className="min-w-0 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          onChange={(event) => setInput(event.target.value)}
          placeholder="I am looking for running shoes"
          value={input}
        />
        <button
          className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
          disabled={isLoading || !input.trim()}
          type="submit"
        >
          Send
        </button>
      </form>
    </section>
  );
}
