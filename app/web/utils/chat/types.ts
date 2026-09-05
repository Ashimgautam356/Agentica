export type ToolCall = {
  name: string;
  args: Record<string, string>;
};

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ProductPreview = {
  id: string;
  name: string;
  imageId: string;
  price: string | number;
};

export type ChatIntent =
  | { type: "smalltalk" }
  | { type: "site_help" }
  | { type: "categories" }
  | { type: "products"; interest?: string }
  | { type: "product_detail"; id: string };

export type McpResponse = {
  id?: number;
  result?: {
    content?: Array<{ type: string; text?: string }>;
  };
  error?: { message?: string };
};
