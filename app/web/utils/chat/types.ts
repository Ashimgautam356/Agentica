export type ToolCall = {
  name: string;
  args: Record<string, string>;
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
