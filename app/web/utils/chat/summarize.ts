import type { ProductPreview } from "./types";

function records(rawText: string) {
  const parsed = JSON.parse(rawText) as { data?: unknown };
  const data = parsed.data ?? parsed;
  const items =
    data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
      ? (data as { items: unknown[] }).items
      : Array.isArray(data)
        ? data
        : [data];
  return items.filter(
    (item): item is Record<string, unknown> => Boolean(item) && typeof item === "object",
  );
}

export function summarizeToolResult(tool: string, rawText: string) {
  try {
    const items = records(rawText).slice(0, 10);
    if (!items.length) return `No ${tool.includes("categor") ? "categories" : "results"} found.`;

    if (tool === "list_categories") {
      return items.map((item) => `- ${String(item.name ?? "Unnamed category")}`).join("\n");
    }

    if (tool === "get_product_reviews") {
      return items
        .map((item) => {
          const user = item.user as Record<string, unknown> | undefined;
          const reviewer = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
          return `- ${String(item.rating ?? "?")}/5${reviewer ? ` by ${reviewer}` : ""}: ${String(item.description ?? "No comment")}`;
        })
        .join("\n");
    }

    return items
      .map((item) => {
        const category = item.category as Record<string, unknown> | undefined;
        return [
          `- ${String(item.name ?? "Unnamed product")}`,
          item.price === undefined ? "" : `Price: Rs ${String(item.price)}`,
          category?.name ? `Category: ${String(category.name)}` : "",
          item.averageRating === undefined
            ? ""
            : `Rating: ${String(item.averageRating)}/5 (${String(item.reviewCount ?? 0)} reviews)`,
          item.description ? `Description: ${String(item.description)}` : "",
        ]
          .filter(Boolean)
          .join(" · ");
      })
      .join("\n");
  } catch {
    return "The catalog response could not be read.";
  }
}

export function productPreviews(tool: string, rawText: string): ProductPreview[] {
  if (tool === "get_product_reviews") return [];

  try {
    const items = records(rawText);

    if (tool === "list_categories") {
      return items
        .filter((item) => typeof item.id === "string" && typeof item.name === "string")
        .slice(0, 6)
        .map((item) => ({
          id: item.id as string,
          name: item.name as string,
          imageId: typeof item.imageId === "string" ? item.imageId : "",
          kind: "category" as const,
        }));
    }

    if (!tool.includes("product")) return [];

    return items
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
        kind: "product" as const,
      }));
  } catch {
    return [];
  }
}
