import type { ProductPreview } from "./types";

export function summarizeToolResult(tool: string, rawText: string) {
  try {
    const parsed = JSON.parse(rawText) as { data?: unknown };
    const data = parsed.data;

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return `No ${tool.includes("categor") ? "categories" : "products"} found.`;
      }

      return data
        .slice(0, 6)
        .map((item) => {
          if (item && typeof item === "object") {
            const record = item as Record<string, unknown>;
            return `- ${String(record.name ?? record.title ?? record.id ?? "Item")}`;
          }

          return `- ${String(item)}`;
        })
        .join("\n");
    }

    return JSON.stringify(data ?? parsed, null, 2);
  } catch {
    return rawText;
  }
}

export function productPreviews(tool: string, rawText: string): ProductPreview[] {
  if (!tool.includes("product")) return [];

  try {
    const parsed = JSON.parse(rawText) as { data?: unknown };
    const data = parsed.data;
    const products = Array.isArray(data)
      ? data
      : data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
        ? (data as { items: unknown[] }).items
        : [data];

    return products
      .filter(
        (product): product is Record<string, unknown> =>
          Boolean(product) &&
          typeof product === "object" &&
          typeof (product as Record<string, unknown>).id === "string" &&
          typeof (product as Record<string, unknown>).name === "string" &&
          typeof (product as Record<string, unknown>).imageId === "string" &&
          ["string", "number"].includes(typeof (product as Record<string, unknown>).price),
      )
      .slice(0, 6)
      .map((product) => ({
        id: product.id as string,
        name: product.name as string,
        imageId: product.imageId as string,
        price: product.price as string | number,
      }));
  } catch {
    return [];
  }
}
