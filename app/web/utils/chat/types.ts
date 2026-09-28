export type ToolCall = {
  name: string;
  args: Record<string, string | number | boolean>;
};

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export const CHAT_HANDOFF_STORAGE_KEY = "agentica_chat_handoff";

export type ChatHandoff = {
  summary: string;
  message: string;
};

export type ProductPreview = {
  id: string;
  name: string;
  imageId: string;
  price?: string | number;
  kind?: "product" | "category";
};

export type ChatAction =
  | {
      type: "add_to_cart";
      product: ProductPreview & { price: string | number; kind?: "product" };
      quantity: number;
    }
  | {
      type: "add_many_to_cart";
      products: Array<ProductPreview & { price: string | number; kind?: "product" }>;
    }
  | { type: "request_checkout_contact" }
  | { type: "confirm_checkout" };

export type StoredChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};

export type ChatIntent =
  | { type: "smalltalk" }
  | { type: "site_help" }
  | { type: "categories" }
  | { type: "products"; interest?: string }
  | { type: "product_detail"; id: string }
  | { type: "product_reviews"; id?: string }
  | { type: "add_to_cart"; id?: string; quantity: number }
  | { type: "add_all_to_cart" }
  | { type: "cart_total" }
  | { type: "checkout" };

export type McpResponse = {
  id?: number;
  result?: {
    content?: Array<{ type: string; text?: string }>;
  };
  error?: { message?: string };
};
