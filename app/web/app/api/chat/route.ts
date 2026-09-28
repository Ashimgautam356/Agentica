import { NextResponse } from "next/server";
import { z } from "zod";
import { callMcp } from "@/utils/chat/mcp-client";
import { productPreviews, summarizeToolResult } from "@/utils/chat/summarize";
import {
  classifyMessage,
  resolveProductReference,
  toolForIntent,
  wantsCatalogImages,
} from "@/utils/chat/tool-router";
import type { ChatAction, ProductPreview, StoredChatMessage } from "@/utils/chat/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sessionIdSchema = z.uuid();
const productPreviewSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(200),
  imageId: z.string().trim().min(1).max(240),
  price: z.union([z.string(), z.number()]),
  kind: z.literal("product").optional(),
});
const requestSchema = z.object({
  sessionId: sessionIdSchema,
  content: z.string().trim().min(1).max(4000),
  handoffSummary: z.string().trim().min(1).max(4000).optional(),
  contextProducts: z.array(productPreviewSchema).max(6).default([]),
});

type BackendResponse<T> = {
  success?: boolean;
  data?: T;
  error?: { message?: string };
};

type BackendCartItem = {
  productId: string;
  name: string;
  imageId: string;
  price: string | number;
  quantity: number;
};

function backendUrl(path: string) {
  const base =
    process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  return `${base.replace(/\/$/, "").replace(/\/api$/, "")}/api${path}`;
}

function forwardedAuthHeaders(request: Request) {
  const headers = new Headers({ "Content-Type": "application/json" });
  for (const name of ["authorization", "cookie"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!headers.has("authorization") && !headers.has("cookie")) {
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) headers.set("x-api-key", apiKey);
  }
  return headers;
}

async function readBackendResponse<T>(response: Response) {
  const body = (await response.json().catch(() => ({}))) as BackendResponse<T>;
  if (!response.ok || !body.data) {
    return {
      error: NextResponse.json(
        { error: body.error?.message ?? "The assistant is temporarily unavailable." },
        { status: response.status || 502 },
      ),
    };
  }
  return { data: body.data };
}

async function backendCart(request: Request) {
  const response = await fetch(backendUrl("/cart"), {
    headers: forwardedAuthHeaders(request),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as BackendResponse<BackendCartItem[]>;
  if (!response.ok || !Array.isArray(body.data)) throw new Error("Could not load cart.");
  return body.data;
}

export async function GET(request: Request) {
  const sessionId = sessionIdSchema.safeParse(new URL(request.url).searchParams.get("sessionId"));
  if (!sessionId.success) {
    return NextResponse.json({ error: "A valid chat session is required." }, { status: 400 });
  }

  try {
    const response = await fetch(backendUrl(`/chat/${sessionId.data}`), {
      headers: forwardedAuthHeaders(request),
      cache: "no-store",
    });
    const result = await readBackendResponse<{ messages: StoredChatMessage[] }>(response);
    if (result.error) return result.error;
    return NextResponse.json({ messages: result.data!.messages });
  } catch {
    return NextResponse.json({ error: "The conversation could not be restored." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A valid message and chat session are required." },
      { status: 400 },
    );
  }

  const apiKey = request.headers.get("x-api-key") ?? undefined;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Generate your Agentica API key before using full chat." },
      { status: 403 },
    );
  }

  const { content, contextProducts, handoffSummary, sessionId } = parsed.data;
  const referencedProduct = resolveProductReference(content, contextProducts);
  const intent = classifyMessage(content, contextProducts);
  const tool = toolForIntent(intent, referencedProduct?.id);

  try {
    let products: ProductPreview[] = [];
    let resolvedProducts: ProductPreview[] = [];
    let catalogContext: string | undefined;
    let action: ChatAction | undefined;
    if (tool) {
      try {
        const mcpResult = await callMcp(tool, apiKey);
        const previews = productPreviews(tool.name, mcpResult);
        resolvedProducts =
          intent.type === "add_to_cart" && contextProducts.length
            ? contextProducts
            : previews.filter((preview) => preview.kind !== "category");
        products = wantsCatalogImages(content) ? previews : [];
        catalogContext = summarizeToolResult(tool.name, mcpResult);

        if (intent.type === "add_to_cart") {
          const product = previews.find((preview) => preview.kind !== "category");
          if (product?.price !== undefined) {
            action = {
              type: "add_to_cart",
              product: { ...product, price: product.price, kind: "product" },
              quantity: intent.quantity,
            };
            catalogContext += `\n\nUI action: Add ${intent.quantity} × ${product.name} to the cart. Confirm this briefly.`;
          }
        }
      } catch (error) {
        console.error("MCP tool call failed", {
          tool: tool.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if ((intent.type === "add_to_cart" || intent.type === "product_reviews") && !tool) {
      const names = contextProducts.map((product) => product.name).join(", ");
      catalogContext = `The product reference is ambiguous. Ask the user to name the product${names ? ` from: ${names}` : ""}.`;
    }

    if (intent.type === "add_all_to_cart") {
      const cartProducts = contextProducts.filter(
        (product): product is ProductPreview & { price: string | number; kind?: "product" } =>
          product.price !== undefined,
      );
      resolvedProducts = contextProducts;
      if (cartProducts.length) {
        action = { type: "add_many_to_cart", products: cartProducts };
        catalogContext = `UI action: Add all of these products to the cart: ${cartProducts.map((product) => product.name).join(", ")}. Confirm this briefly.`;
      } else {
        catalogContext =
          "There is no current product list to add. Ask the user to show or name the products first.";
      }
    }

    if (intent.type === "cart_total") {
      const cart = await backendCart(request);
      const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
      catalogContext = cart.length
        ? `The backend cart contains ${cart.map((item) => `${item.quantity} × ${item.name}`).join(", ")}. Exact cart total: Rs ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
        : "The backend cart is empty. The exact cart total is Rs 0.00.";
    }

    if (intent.type === "checkout") {
      if ((await backendCart(request)).length > 0) {
        action = { type: "request_checkout_contact" };
        catalogContext =
          "The cart has products. Ask the user for the 10-digit contact number for this delivery. Checkout will continue entirely inside chat.";
      } else {
        catalogContext = "The cart is empty. Ask the user to add a product before checkout.";
      }
    }

    const response = await fetch(backendUrl(`/chat/${sessionId}/message`), {
      method: "POST",
      headers: forwardedAuthHeaders(request),
      body: JSON.stringify({ content, handoffSummary, catalogContext }),
      cache: "no-store",
    });
    const result = await readBackendResponse<{
      userMessage: StoredChatMessage;
      assistantMessage: StoredChatMessage;
    }>(response);
    if (result.error) return result.error;

    return NextResponse.json({
      message: result.data!.assistantMessage,
      reply: result.data!.assistantMessage.content,
      tool: tool?.name,
      products,
      contextProducts: resolvedProducts,
      action,
    });
  } catch {
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable." },
      { status: 502 },
    );
  }
}
