const URL_IGNORED = /[\t\n\r]/g;

const DOT_DOT_SEGMENT = /(^|[/\\])(\.|%2e){2}([/\\]|$)/i;

export const isInAppPath = (url: unknown): url is string => {
  if (typeof url !== "string") return false;
  const cleaned = url.replace(URL_IGNORED, "");
  return (
    /^\/(?![/\\])/.test(cleaned) &&
    !DOT_DOT_SEGMENT.test(cleaned.split(/[?#]/)[0])
  );
};

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

// Where a user-supplied link may point: an in-app path as is, or a valid
// http(s) address. Null means it must not be rendered as a link.
export const resolveLinkTarget = (raw: unknown): string | null =>
  isInAppPath(raw) ? raw.trim() : normalizeExternalUrl(raw);
