"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
  tool?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Ask for products, categories, or try: echo hello.",
    },
  ]);
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
    <main className="shell">
      <section className="chat">
        <header className="chatHeader">
          <p className="eyebrow">Agentica MCP</p>
          <h1>Backend-connected chat</h1>
        </header>

        <div className="messages" aria-live="polite">
          {messages.map((message, index) => (
            <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
              {message.tool ? <p className="tool">{message.tool}</p> : null}
              <p>{message.text}</p>
            </article>
          ))}
          {isLoading ? (
            <article className="message assistant">
              <p>Calling MCP...</p>
            </article>
          ) : null}
        </div>

        <form className="composer" onSubmit={submit}>
          <input
            aria-label="Chat message"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Show me products"
            value={input}
          />
          <button disabled={isLoading || !input.trim()} type="submit">
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
