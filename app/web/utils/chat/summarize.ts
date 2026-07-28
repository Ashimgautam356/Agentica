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
