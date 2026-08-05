import Hive from "@/types/Hive";

// The analytics dashboard's own content hues: posts indigo, comments teal.
export const POST_COLOR = "#6366f1";
export const COMMENT_COLOR = "#14b8a6";
// The No-community / Other buckets are neutral, not real community hues.
export const NO_COMMUNITY_COLOR = "#64748b";
export const OTHER_COLOR = "#475569";

// "community" = a real named community (clickable); "other" = the rolled-up tail
// of small communities; "none" = the No-community (personal blog) bucket.
export type CommunityKind = "community" | "other" | "none";

export interface CommunityActivity {
  community: string | null; // hive-XXXXX, else null
  title: string;
  posts: number;
  comments: number;
  total: number;
  kind: CommunityKind;
  members?: CommunityActivity[]; // set on the "other" bucket: the rolled-up tail
}

// Fold the flat API rows into one entry per community, sorted by total activity.
// A row with community === null is the No-community bucket; relabelled locally so
// the UI never leans on the API's English title.
export function groupCommunityActivity(
  rows: Hive.AccountCommunityActivityRow[] | undefined,
  noCommunityLabel: string
): CommunityActivity[] {
  return (rows ?? [])
    .map((r) => ({
      community: r.community,
      title: r.community === null ? noCommunityLabel : r.title,
      posts: r.post_count,
      comments: r.comment_count,
      total: r.post_count + r.comment_count,
      kind: (r.community === null ? "none" : "community") as CommunityKind,
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

// Keep the top-N named communities; fold the rest into one "Other communities"
// box so the treemap stays readable without dropping activity (totals still
// reconcile). The No-community bucket is always kept and shown separately.
// topN === Infinity shows every community individually.
export function rollupCommunities(
  items: CommunityActivity[],
  topN: number,
  otherLabel: (count: number) => string
): CommunityActivity[] {
  const none = items.find((c) => c.kind === "none") ?? null;
  const named = items.filter((c) => c.kind === "community");
  const shown = named.slice(0, topN);
  const rest = named.slice(topN);

  const out: CommunityActivity[] = [...shown];
  if (rest.length > 0) {
    const posts = rest.reduce((s, c) => s + c.posts, 0);
    const comments = rest.reduce((s, c) => s + c.comments, 0);
    out.push({
      community: null,
      title: otherLabel(rest.length),
      posts,
      comments,
      total: posts + comments,
      kind: "other",
      members: rest,
    });
  }
  if (none) out.push(none);
  return out;
}

export interface CommunityStats {
  totalPosts: number;
  totalComments: number;
  totalContent: number;
  communityCount: number; // named communities (excludes Other/No-community)
  top: CommunityActivity | null; // top NAMED community
}

// Computed over the FULL (pre-rollup) list so counts and totals are exact.
export function communityStats(items: CommunityActivity[]): CommunityStats {
  const totalPosts = items.reduce((s, c) => s + c.posts, 0);
  const totalComments = items.reduce((s, c) => s + c.comments, 0);
  const named = items.filter((c) => c.kind === "community");
  return {
    totalPosts,
    totalComments,
    totalContent: totalPosts + totalComments,
    communityCount: named.length,
    top: named[0] ?? null, // items are pre-sorted by total desc
  };
}

export interface TreemapNode {
  name: string;
  value: number;
  posts: number;
  comments: number;
  postPct: number; // share of the tile that is posts, 0–100
  community: string | null;
  kind: CommunityKind;
  members?: CommunityActivity[];
  itemStyle: { color: string };
}

// Five steps from the dashboard's comments-teal to its posts-indigo, deepened one
// tier so white labels stay legible on every step.
export const MIX_SCALE = [
  "#0f766e",
  "#1f6a8c",
  "#2f5eaa",
  "#3f52c7",
  "#4f46e5",
];

// Discrete bins, not a continuous blend: five steps stay distinguishable side by
// side, a gradient does not.
export function mixColor(posts: number, comments: number): string {
  const total = posts + comments;
  if (total <= 0) return MIX_SCALE[2];
  const share = posts / total;
  if (share < 0.1) return MIX_SCALE[0];
  if (share < 0.35) return MIX_SCALE[1];
  if (share < 0.65) return MIX_SCALE[2];
  if (share < 0.9) return MIX_SCALE[3];
  return MIX_SCALE[4];
}

// One tile per community: area is total activity, colour is the posts/comments
// mix. The Other and No-community buckets stay neutral — they are not places.
export function buildTreemap(items: CommunityActivity[]): TreemapNode[] {
  return items.map((c) => ({
    name: c.title,
    value: c.total,
    posts: c.posts,
    comments: c.comments,
    postPct: c.total > 0 ? Math.round((c.posts / c.total) * 100) : 0,
    community: c.community,
    kind: c.kind,
    ...(c.members ? { members: c.members } : {}),
    itemStyle: {
      color:
        c.kind === "community"
          ? mixColor(c.posts, c.comments)
          : c.kind === "other"
            ? OTHER_COLOR
            : NO_COMMUNITY_COLOR,
    },
  }));
}
