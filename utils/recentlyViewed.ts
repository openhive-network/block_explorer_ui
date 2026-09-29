export type RecentKind = "account" | "block" | "tx";

export interface RecentEntry {
  kind: RecentKind;
  id: string;
}

export const RECENT_VIEWS_EVENT = "hivescan:recent-views";
export const RECENT_LIMIT = 6;

export const recentViewsKey = (username?: string | null) =>
  `hivescan_recent_views_${username || "guest"}`;

// "/@alice/…", "/block/123", "/tx/<hash>" → an entry; anything else → null.
export const pathToRecentEntry = (asPath: string): RecentEntry | null => {
  const path = decodeURIComponent(asPath.split(/[?#]/)[0]);
  const account = path.match(/^\/@([a-z0-9.-]{3,16})(?:\/|$)/);
  if (account) return { kind: "account", id: account[1] };
  const block = path.match(/^\/block\/(\d+)\/?$/);
  if (block) return { kind: "block", id: block[1] };
  const tx = path.match(/^\/tx\/([0-9a-f]{40})\/?$/i);
  if (tx) return { kind: "tx", id: tx[1].toLowerCase() };
  return null;
};

export const addRecentEntry = (
  entries: RecentEntry[],
  entry: RecentEntry
): RecentEntry[] =>
  [
    entry,
    ...entries.filter((e) => !(e.kind === entry.kind && e.id === entry.id)),
  ].slice(0, RECENT_LIMIT);

export const readRecentViews = (username?: string | null): RecentEntry[] => {
  try {
    const raw = localStorage.getItem(recentViewsKey(username));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeRecentViews = (
  username: string | null | undefined,
  entries: RecentEntry[]
) => {
  try {
    if (entries.length) {
      localStorage.setItem(recentViewsKey(username), JSON.stringify(entries));
    } else {
      localStorage.removeItem(recentViewsKey(username));
    }
    window.dispatchEvent(new Event(RECENT_VIEWS_EVENT));
  } catch {
    // Storage blocked: the list simply stays empty.
  }
};
