import Hive from "@/types/Hive";
import {
  MIX_SCALE,
  OTHER_COLOR,
  NO_COMMUNITY_COLOR,
  groupCommunityActivity,
  rollupCommunities,
  communityStats,
  buildTreemap,
  mixColor,
} from "@/utils/communityActivity";

const row = (
  community: string | null,
  title: string,
  post_count: number,
  comment_count: number
): Hive.AccountCommunityActivityRow => ({
  community,
  title,
  post_count,
  comment_count,
});

// Mirrors the real response: named communities + a single null "No community"
// bucket; the buckets sum to content-stats' posts + comments for the range.
const SAMPLE: Hive.AccountCommunityActivityRow[] = [
  row("hive-124452", "Ladies of Hive", 4, 31),
  row("hive-178138", "The Pub", 0, 14),
  row(null, "Personal blog / No community", 1, 15),
];

const NO_COMMUNITY = "Personal blog";
const otherLabel = (n: number) => `Other communities (${n})`;

describe("groupCommunityActivity", () => {
  it("sorts by total activity desc and totals posts + comments", () => {
    const items = groupCommunityActivity(SAMPLE, NO_COMMUNITY);
    expect(items.map((c) => c.title)).toEqual([
      "Ladies of Hive", // 35
      "Personal blog", // 16
      "The Pub", // 14
    ]);
    const loh = items[0];
    expect(loh.posts).toBe(4);
    expect(loh.comments).toBe(31);
    expect(loh.total).toBe(35);
    expect(loh.kind).toBe("community");
  });

  it("relabels the null community bucket locally as kind 'none'", () => {
    const bucket = groupCommunityActivity(SAMPLE, NO_COMMUNITY).find(
      (c) => c.kind === "none"
    )!;
    expect(bucket.community).toBeNull();
    expect(bucket.title).toBe(NO_COMMUNITY);
    expect(bucket.total).toBe(16);
  });

  it("drops zero-total rows and handles empty input", () => {
    expect(
      groupCommunityActivity([row("hive-1", "x", 0, 0)], NO_COMMUNITY)
    ).toEqual([]);
    expect(groupCommunityActivity(undefined, NO_COMMUNITY)).toEqual([]);
  });
});

describe("rollupCommunities", () => {
  const many = groupCommunityActivity(
    [
      row("hive-1", "A", 10, 0), // 10
      row("hive-2", "B", 0, 8), // 8
      row("hive-3", "C", 0, 5), // 5
      row("hive-4", "D", 0, 3), // 3
      row(null, "No community", 0, 2), // 2
    ],
    NO_COMMUNITY
  );

  it("keeps top-N named communities, rolls the rest into Other, keeps No-community last", () => {
    const out = rollupCommunities(many, 2, otherLabel);
    expect(out.map((c) => c.title)).toEqual([
      "A",
      "B",
      "Other communities (2)", // C + D
      "Personal blog",
    ]);
    const other = out.find((c) => c.kind === "other")!;
    expect(other.total).toBe(8); // 5 + 3
    expect(other.comments).toBe(8);
  });

  it("adds no Other box when nothing is left over, and reconciles the total", () => {
    const out = rollupCommunities(many, 99, otherLabel);
    expect(out.some((c) => c.kind === "other")).toBe(false);
    const shownTotal = out.reduce((s, c) => s + c.total, 0);
    const fullTotal = many.reduce((s, c) => s + c.total, 0);
    expect(shownTotal).toBe(fullTotal); // roll-up never loses activity
  });
});

describe("communityStats", () => {
  it("reconciles totals and counts named communities only", () => {
    const stats = communityStats(groupCommunityActivity(SAMPLE, NO_COMMUNITY));
    expect(stats.totalPosts).toBe(5);
    expect(stats.totalComments).toBe(60);
    expect(stats.totalContent).toBe(65);
    expect(stats.communityCount).toBe(2); // No-community not counted
    expect(stats.top?.title).toBe("Ladies of Hive");
  });

  it("is safe on an empty set", () => {
    const stats = communityStats([]);
    expect(stats.totalContent).toBe(0);
    expect(stats.communityCount).toBe(0);
    expect(stats.top).toBeNull();
  });
});

describe("mixColor", () => {
  it("walks the scale from comments-only to posts-only", () => {
    expect(mixColor(0, 10)).toBe(MIX_SCALE[0]);
    expect(mixColor(2, 8)).toBe(MIX_SCALE[1]);
    expect(mixColor(5, 5)).toBe(MIX_SCALE[2]);
    expect(mixColor(8, 2)).toBe(MIX_SCALE[3]);
    expect(mixColor(10, 0)).toBe(MIX_SCALE[4]);
  });

  it("is safe on an empty tile", () => {
    expect(mixColor(0, 0)).toBe(MIX_SCALE[2]);
  });
});

describe("buildTreemap", () => {
  it("emits one flat tile per community, sized by total activity", () => {
    const nodes = buildTreemap(groupCommunityActivity(SAMPLE, NO_COMMUNITY));
    expect(nodes).toHaveLength(3);
    const loh = nodes[0];
    expect(loh.name).toBe("Ladies of Hive");
    expect(loh.value).toBe(35);
    expect(loh.posts).toBe(4);
    expect(loh.comments).toBe(31);
    expect(loh.postPct).toBe(11); // 4 / 35
    expect(nodes).not.toHaveProperty("0.children");
  });

  it("colours named communities by their posts/comments mix", () => {
    const nodes = buildTreemap(groupCommunityActivity(SAMPLE, NO_COMMUNITY));
    const pub = nodes.find((n) => n.name === "The Pub")!;
    expect(pub.itemStyle.color).toBe(MIX_SCALE[0]); // comments only
    expect(pub.postPct).toBe(0);
    expect(nodes[0].itemStyle.color).toBe(mixColor(4, 31));
  });

  it("keeps the Other and No-community buckets neutral", () => {
    const rolled = rollupCommunities(
      groupCommunityActivity(
        [
          row("hive-1", "A", 10, 0),
          row("hive-2", "B", 0, 8),
          row("hive-3", "C", 0, 5),
          row(null, "No community", 1, 1),
        ],
        NO_COMMUNITY
      ),
      2,
      otherLabel
    );
    const nodes = buildTreemap(rolled);
    expect(nodes.find((n) => n.kind === "other")!.itemStyle.color).toBe(
      OTHER_COLOR
    );
    expect(nodes.find((n) => n.kind === "none")!.itemStyle.color).toBe(
      NO_COMMUNITY_COLOR
    );
    expect(MIX_SCALE).not.toContain(OTHER_COLOR);
  });
});
