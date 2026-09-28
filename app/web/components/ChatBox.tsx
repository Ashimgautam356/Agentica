"use client";

import { Bot, LoaderCircle, RotateCcw, Send, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/products/ProductImage";
import { formatPrice } from "@/components/products/ProductCard";
import { api, getApiError, type ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { type CartItem, useCartStore } from "@/stores/cart-store";
import {
  CHAT_HANDOFF_STORAGE_KEY,
  type ChatAction,
  type ChatHandoff,
  type ProductPreview,
  type StoredChatMessage,
} from "@/utils/chat/types";
import { checkoutAddress, checkoutContact, TEST_CARD } from "@/utils/chat/checkout";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool?: string;
  products?: ProductPreview[];
  contextProducts?: ProductPreview[];
  action?: ChatAction;
};

type CheckoutDraft = {
  step: "contact" | "address" | "confirm";
  contact?: string;
  address?: string;
  orderId?: string;
};

type Order = { id: string };
type PaymentResult = { success: boolean; transactionId: string; status: "PAID" | "FAILED" };

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

function displayMessages(messages: StoredChatMessage[]): Message[] {
  return messages
    .filter((message) => message.role !== "SYSTEM")
    .map((message) => ({
      id: message.id,
      role: message.role === "USER" ? "user" : "assistant",
      content: message.content,
    }));
}

type ChatResponse = {
  message?: StoredChatMessage;
  reply?: string;
  tool?: string;
  products?: ProductPreview[];
  contextProducts?: ProductPreview[];
  action?: ChatAction;
  error?: string;
};

function readHandoff(): ChatHandoff | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(CHAT_HANDOFF_STORAGE_KEY) ?? "null") as {
      summary?: unknown;
      message?: unknown;
    } | null;
    return value && typeof value.summary === "string" && typeof value.message === "string"
      ? { summary: value.summary, message: value.message }
      : null;
  } catch {
    return null;
  }
}

async function requestReply(
  sessionId: string,
  content: string,
  token: string | null,
  apiKey: string | null,
  contextProducts: ProductPreview[] = [],
  handoffSummary?: string,
  signal?: AbortSignal,
) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify({
      sessionId,
      content,
      handoffSummary,
      contextProducts,
    }),
    signal,
  });
  return { response, data: (await response.json()) as ChatResponse };
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [checkoutDraft, setCheckoutDraft] = useState<CheckoutDraft | null>(null);
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const addCartItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const bottomRef = useRef<HTMLDivElement>(null);
  const checkoutLockRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function restoreConversation() {
      if (!hasHydrated) return;
      if (!customer) {
        if (active) {
          setCheckoutDraft(null);
          setSessionId(null);
          setMessages([welcomeMessage]);
          setIsRestoring(false);
        }
        return;
      }

      if (!customer.apiKey) {
        if (active) {
          setCheckoutDraft(null);
          setSessionId(null);
          setMessages([welcomeMessage]);
          setIsRestoring(false);
        }
        return;
      }

      const storageKey = `agentica_chat_session:${customer.id}`;
      const handoff = readHandoff();
      if (handoff) {
        const nextSessionId = crypto.randomUUID();
        window.localStorage.setItem(storageKey, nextSessionId);
        window.localStorage.removeItem(CHAT_HANDOFF_STORAGE_KEY);
        window.localStorage.removeItem("agentica_chat_preview");
        window.sessionStorage.removeItem("agentica_chat_preview_active");
        if (active) {
          setSessionId(nextSessionId);
          setMessages([
            welcomeMessage,
            { id: crypto.randomUUID(), role: "user", content: handoff.message },
          ]);
          setIsRestoring(true);
        }

        try {
          const { response, data } = await requestReply(
            nextSessionId,
            handoff.message,
            token,
            customer.apiKey,
            [],
            handoff.summary,
            controller.signal,
          );
          if (!active) return;
          setMessages((current) => [
            ...current,
            {
              id: data.message?.id ?? crypto.randomUUID(),
              role: "assistant",
              content: response.ok
                ? (data.reply ?? "I couldn’t generate a response.")
                : (data.error ?? "The assistant is temporarily unavailable."),
              tool: data.tool,
              products: data.products,
              contextProducts: data.contextProducts,
              action: data.action,
            },
          ]);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (active) {
            setMessages((current) => [
              ...current,
              {
                id: "handoff-error",
                role: "assistant",
                content: "I couldn’t continue the quick chat. Please send your message again.",
              },
            ]);
          }
        } finally {
          if (active) setIsRestoring(false);
        }
        return;
      }

      const storedSessionId = window.localStorage.getItem(storageKey);
      const nextSessionId = storedSessionId ?? crypto.randomUUID();
      window.localStorage.setItem(storageKey, nextSessionId);

      if (active) {
        setSessionId(nextSessionId);
        setMessages([welcomeMessage]);
      }
      if (!storedSessionId) {
        if (active) {
          setMessages([welcomeMessage]);
          setIsRestoring(false);
        }
        return;
      }

      if (active) setIsRestoring(true);
      try {
        const response = await fetch(`/api/chat?sessionId=${encodeURIComponent(nextSessionId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          signal: controller.signal,
          cache: "no-store",
        });
        if (response.status === 404) {
          if (active) setMessages([welcomeMessage]);
          return;
        }
        const data = (await response.json()) as { messages?: StoredChatMessage[]; error?: string };
        if (!response.ok) throw new Error(data.error);
        const history = displayMessages(data.messages ?? []);
        if (active) {
          setMessages(history.length ? [welcomeMessage, ...history] : [welcomeMessage]);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (active) {
          setMessages([
            welcomeMessage,
            {
              id: "history-error",
              role: "assistant",
              content: "I couldn’t restore this conversation. You can still start a new one.",
            },
          ]);
        }
      } finally {
        if (active) setIsRestoring(false);
      }
    }

    void restoreConversation();

    return () => {
      active = false;
      controller.abort();
    };
  }, [customer, hasHydrated, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || isLoading || !customer?.apiKey) return;

    if (checkoutDraft) {
      continueCheckout(content);
      return;
    }

    const activeSessionId = sessionId ?? crypto.randomUUID();
    if (!sessionId) {
      setSessionId(activeSessionId);
      window.localStorage.setItem(`agentica_chat_session:${customer.id}`, activeSessionId);
    }

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
      const { response, data } = await requestReply(
        activeSessionId,
        content,
        token,
        customer.apiKey,
        [...messages]
          .reverse()
          .find((message) => message.role === "assistant" && message.contextProducts?.length)
          ?.contextProducts ?? [],
      );

      let cartUpdated = true;
      if (response.ok && data.action?.type === "add_to_cart") {
        cartUpdated = await addCartItem(data.action.product, data.action.quantity);
      }
      if (response.ok && data.action?.type === "add_many_to_cart") {
        for (const product of data.action.products) {
          if (!(await addCartItem(product))) cartUpdated = false;
        }
      }
      if (response.ok && data.action?.type === "request_checkout_contact") {
        setCheckoutDraft({ step: "contact" });
      }

      setMessages((current) => [
        ...current,
        {
          id: data.message?.id ?? crypto.randomUUID(),
          role: "assistant",
          content: !cartUpdated
            ? "I couldn’t add that product to your cart. Please try again."
            : response.ok
              ? (data.reply ?? "I couldn’t generate a response.")
              : (data.error ?? "The assistant is temporarily unavailable."),
          tool: data.tool,
          products: data.products,
          contextProducts: data.contextProducts,
          action: data.action,
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

  function continueCheckout(content: string) {
    const draft = checkoutDraft;
    if (!draft) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content };
    if (/\b(cancel|stop|never mind|nevermind)\b/i.test(content)) {
      setCheckoutDraft(null);
      setMessages((current) => [
        ...current,
        userMessage,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Checkout cancelled. Your products are still in the cart.",
        },
      ]);
      setInput("");
      return;
    }

    if (draft.step === "contact") {
      const contact = checkoutContact(content);
      setMessages((current) => [
        ...current,
        userMessage,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: contact
            ? "Thanks. What shipping address should we use?"
            : "Please enter a valid 10-digit contact number.",
        },
      ]);
      if (contact) setCheckoutDraft({ step: "address", contact });
      setInput("");
      return;
    }

    if (draft.step === "address") {
      const address = checkoutAddress(content);
      setMessages((current) => [
        ...current,
        userMessage,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: address
            ? `Please confirm checkout.\nContact: ${draft.contact}\nShipping address: ${address}\nPayment: Agentica static test card (no real charge).`
            : "Please enter a shipping address between 5 and 240 characters.",
          action: address ? { type: "confirm_checkout" } : undefined,
        },
      ]);
      if (address) setCheckoutDraft({ ...draft, step: "confirm", address });
      setInput("");
      return;
    }

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Use the confirmation button below to place and pay for this order, or say cancel.",
        action: { type: "confirm_checkout" },
      },
    ]);
    setInput("");
  }

  async function completeCheckout() {
    if (
      !customer ||
      checkoutDraft?.step !== "confirm" ||
      !checkoutDraft.contact ||
      !checkoutDraft.address ||
      checkoutLockRef.current
    ) {
      return;
    }

    checkoutLockRef.current = true;
    setIsLoading(true);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: "Confirm and pay for my order." },
    ]);

    try {
      const cart = await api.get<ApiResponse<CartItem[]>>("/cart");
      if (!cart.data.data.length) throw new Error("Your cart is empty.");
      let orderId = checkoutDraft.orderId;
      if (!orderId) {
        const order = await api.post<ApiResponse<Order>>("/orders", {
          items: cart.data.data.map(({ productId, quantity }) => ({ productId, quantity })),
          shippingName:
            [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email,
          shippingContact: checkoutDraft.contact,
          shippingAddress: checkoutDraft.address,
        });
        orderId = order.data.data.id;
        setCheckoutDraft({ ...checkoutDraft, orderId });
      }

      const payment = await api.post<ApiResponse<PaymentResult>>("/payments/process", {
        orderId,
        cardNumber: TEST_CARD.cardNumber,
        expiryMonth: TEST_CARD.expiryMonth,
        expiryYear: String(new Date().getFullYear() + 2),
        cvv: TEST_CARD.cvv,
      });
      if (!payment.data.data.success) throw new Error("The test payment was declined.");

      await clearCart();
      setCheckoutDraft(null);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Payment successful. Your order has been placed. Transaction: ${payment.data.data.transactionId}`,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: getApiError(error, "Checkout could not be completed. Please try again."),
          action: { type: "confirm_checkout" },
        },
      ]);
    } finally {
      checkoutLockRef.current = false;
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
              className="grid h-9 w-9 place-items-center rounded-full text-[#7c8798] transition hover:bg-[#eef5f1] hover:text-text-dark disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || isRestoring}
              onClick={() => {
                if (customer) {
                  const nextSessionId = crypto.randomUUID();
                  window.localStorage.setItem(
                    `agentica_chat_session:${customer.id}`,
                    nextSessionId,
                  );
                  setSessionId(nextSessionId);
                }
                setMessages([welcomeMessage]);
                setCheckoutDraft(null);
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
                    {message.products?.length ? (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {message.products.map((product) => (
                          <Link
                            className="overflow-hidden rounded-xl border border-[#e1e9e4] bg-[#f8fbf9] transition hover:border-main-green"
                            href={
                              product.kind === "category"
                                ? `/products?categoryId=${product.id}`
                                : `/products/${product.id}`
                            }
                            key={product.id}
                          >
                            <ProductImage
                              className="aspect-[4/3] w-full"
                              imageId={product.imageId}
                              name={product.name}
                            />
                            <div className="p-2">
                              <p className="line-clamp-2 text-xs font-extrabold text-text-dark">
                                {product.name}
                              </p>
                              {product.price !== undefined ? (
                                <p className="mt-0.5 text-xs font-bold text-[#16a34a]">
                                  Rs {formatPrice(product.price)}
                                </p>
                              ) : null}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    {message.action?.type === "confirm_checkout" &&
                    checkoutDraft?.step === "confirm" ? (
                      <button
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-main-green px-4 py-2 text-xs font-extrabold text-white hover:bg-main-green-hover"
                        disabled={isLoading}
                        onClick={() => void completeCheckout()}
                        type="button"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Confirm and pay
                      </button>
                    ) : null}
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
                      disabled={isLoading || isRestoring || !customer?.apiKey}
                      key={suggestion}
                      onClick={() => void sendMessage(suggestion)}
                      type="button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}

              {isLoading || isRestoring ? (
                <article className="flex items-end gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[#e1e9e4] bg-white px-4 py-3 text-sm text-[#7c8798]">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    {isRestoring ? "Restoring conversation" : "Thinking"}
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
            {hasHydrated && !customer ? (
              <p className="mx-auto mb-3 max-w-3xl rounded-xl bg-[#f1fbf4] px-4 py-3 text-center text-sm text-[#526273]">
                <Link
                  className="font-extrabold text-[#16a34a] hover:underline"
                  href="/login?next=/chat"
                >
                  Sign in
                </Link>{" "}
                to save and continue your conversations.
              </p>
            ) : null}
            {hasHydrated && customer && !customer.apiKey ? (
              <p className="mx-auto mb-3 max-w-3xl rounded-xl bg-[#fff7ed] px-4 py-3 text-center text-sm text-[#9a4d0f]">
                Generate your Agentica API key before chatting.{" "}
                <Link className="font-extrabold underline" href="/profile/api-keys">
                  Generate API key
                </Link>
              </p>
            ) : null}
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-[#ccd9d2] bg-[#fbfdfc] p-2 focus-within:border-main-green focus-within:ring-3 focus-within:ring-main-green/10">
              <textarea
                aria-label="Message Agentica"
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-text-dark outline-none placeholder:text-[#9aa4b2]"
                disabled={!hasHydrated || !customer?.apiKey || isRestoring}
                maxLength={4000}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  checkoutDraft?.step === "contact"
                    ? "Enter your 10-digit contact number…"
                    : checkoutDraft?.step === "address"
                      ? "Enter your shipping address…"
                      : checkoutDraft?.step === "confirm"
                        ? "Confirm below or say cancel…"
                        : "Ask me about products, categories, or checkout…"
                }
                rows={1}
                value={input}
              />
              <button
                aria-label="Send message"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-main-green text-white transition hover:bg-main-green-hover disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading || isRestoring || !customer?.apiKey || !input.trim()}
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
