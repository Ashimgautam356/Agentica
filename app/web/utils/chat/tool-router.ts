import type { ChatIntent, ToolCall } from "./types";

const productWords = [
  "buy",
  "find",
  "looking",
  "need",
  "product",
  "products",
  "recommend",
  "shop",
  "show",
  "want",
];

const helpWords = ["about", "how", "site", "website", "work", "works", "what is", "who are"];
const categoryWords = ["categories", "category", "types"];
const interests = ["phone", "phones", "shoe", "shoes", "sneaker", "sneakers"];

export function classifyMessage(message: string): ChatIntent {
  const text = message.toLowerCase();
  const id = message.match(/\b(?:product|id)\s+([a-zA-Z0-9_-]+)/)?.[1];

  if (id) {
    return { type: "product_detail", id };
  }

  if (categoryWords.some((word) => text.includes(word))) {
    return { type: "categories" };
  }

  const interest = interests.find((word) => text.includes(word));
  if (interest || productWords.some((word) => text.includes(word))) {
    return { type: "products", interest };
  }

  if (helpWords.some((word) => text.includes(word))) {
    return { type: "site_help" };
  }

  return { type: "smalltalk" };
}

export function toolForIntent(intent: ChatIntent): ToolCall | null {
  switch (intent.type) {
    case "categories":
      return { name: "list_categories", args: {} };
    case "product_detail":
      return { name: "get_product", args: { id: intent.id } };
    case "products":
      return { name: "list_products", args: {} };
    default:
      return null;
  }
}
