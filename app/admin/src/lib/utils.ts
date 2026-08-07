export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
