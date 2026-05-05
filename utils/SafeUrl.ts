/**
 * Returns the URL as a string if it parses as http(s), otherwise null.
 * Used to gate user-supplied URLs (dashboard widgets, embeds) before
 * rendering them as iframe src or anchor href, where a `javascript:` or
 * `data:` URL would otherwise execute on click.
 */
export const normalizeExternalUrl = (raw: unknown): string | null => {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};
