import type { ChatIntent, ProductPreview, ToolCall } from "./types";

const productWords = [
  "buy",
  "find",
  "image",
  "looking",
  "need",
  "photo",
  "picture",
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

function productId(message: string) {
  return message.match(
    /\b(?:product|id)\s+([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\b/i,
  )?.[1];
}

export function wantsCatalogImages(message: string) {
  return /\b(image|images|photo|photos|picture|pictures|preview|look like)\b/i.test(message);
}

export function resolveProductReference(message: string, products: ProductPreview[]) {
  const text = message.toLowerCase();
  const named = products.find((product) => text.includes(product.name.toLowerCase()));
  return named ?? (products.length === 1 ? products[0] : undefined);
}

export function classifyMessage(message: string, products: ProductPreview[] = []): ChatIntent {
  const text = message.toLowerCase();
  const id = productId(message);
  const referenced = resolveProductReference(message, products);

  if (
    /\b(check\s*out|checkout|pay now|complete (?:my |the )?purchase|place (?:my |the )?order)\b/.test(
      text,
    )
  ) {
    return { type: "checkout" };
  }

  if (/\b(total|subtotal|how much)\b/.test(text)) {
    return { type: "cart_total" };
  }

  if (/\b(review|reviews|rating|ratings)\b/.test(text)) {
    return { type: "product_reviews", id: id ?? referenced?.id };
  }

  if (
    /\b(all|every)\b/.test(text) &&
    /\b(product|products|item|items)\b/.test(text) &&
    /\b(add|buy|need|take|want)\b/.test(text)
  ) {
    return { type: "add_all_to_cart" };
  }

  if (
    /\b(add .+ to (?:my )?cart|add (?:it|this|that|the product)?\s*(?:to (?:my )?)?cart|i want (?:it|this|that|the product)|i(?:'ll| will) take (?:it|this|that)|buy this)\b/.test(
      text,
    ) ||
    (referenced && /\b(add|buy|take|want)\b/.test(text))
  ) {
    const quantity = Math.max(1, Math.min(999, Number(text.match(/\b(\d{1,3})\b/)?.[1]) || 1));
    return { type: "add_to_cart", id: id ?? referenced?.id, quantity };
  }

  if (id) {
    return { type: "product_detail", id };
  }

  if (referenced && /\b(about|detail|details|information|describe)\b/.test(text)) {
    return { type: "product_detail", id: referenced.id };
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

export function toolForIntent(intent: ChatIntent, referencedProductId?: string): ToolCall | null {
  switch (intent.type) {
    case "categories":
      return { name: "list_categories", args: {} };
    case "product_detail":
      return { name: "get_product", args: { id: intent.id } };
    case "product_reviews": {
      const id = intent.id ?? referencedProductId;
      return id ? { name: "get_product_reviews", args: { product_id: id } } : null;
    }
    case "add_to_cart": {
      const id = intent.id ?? referencedProductId;
      return id ? { name: "get_product", args: { id } } : null;
    }
    case "products":
      return { name: "list_products", args: intent.interest ? { search: intent.interest } : {} };
    default:
      return null;
  }
}
