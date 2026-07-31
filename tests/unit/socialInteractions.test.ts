import Hive from "@/types/Hive";
import {
  INTERACTION_TYPES,
  groupInteractions,
  buildSankey,
  truncatedTypes,
} from "@/utils/socialInteractions";

const row = (
  interaction_type: Hive.AccountInteractionType,
  partner: string | null,
  interaction_count: number,
  partner_rank: number,
  partners_merged: number,
  covered_from: string
): Hive.AccountInteractionRow => ({
  interaction_type,
  partner,
  interaction_count,
  partner_rank,
  partners_merged,
  covered_from,
});

// Mirrors the real actifit-shaped response: Top-N named partners + a partner:null
// "Others" band per type, with per-type covered_from.
const SAMPLE: Hive.AccountInteractionRow[] = [
  row("reply", "carrinm", 42, 1, 1, "2026-06-18"),
  row("reply", "manuvert", 30, 2, 1, "2026-06-18"),
  row("reply", null, 3735, 3, 231, "2026-06-18"),
  row("transfer", "steembasicincome", 466, 1, 1, "2016-03-24"),
  row("transfer", "bittrex", 41, 2, 1, "2016-03-24"),
  row("transfer", null, 593, 3, 213, "2016-03-24"),
];

const labels = {
  you: "@actifit",
  others: "Others",
  typeLabel: (type: Hive.AccountInteractionType) => type,
};

describe("groupInteractions", () => {
  it("returns one group per interaction type in fixed order", () => {
    const groups = groupInteractions(SAMPLE);
    expect(groups.map((g) => g.type)).toEqual(INTERACTION_TYPES);
  });

  it("sums named partners + Others band into the type total", () => {
    const reply = groupInteractions(SAMPLE).find((g) => g.type === "reply")!;
    expect(reply.partners.map((p) => p.account)).toEqual([
      "carrinm",
      "manuvert",
    ]);
    expect(reply.othersCount).toBe(3735);
    expect(reply.othersAccounts).toBe(231);
    expect(reply.total).toBe(42 + 30 + 3735);
    expect(reply.hasData).toBe(true);
    expect(reply.coveredFrom).toBe("2026-06-18");
  });

  it("sorts partners by rank", () => {
    const scrambled = [
      row("vote", "b", 5, 2, 1, "2026-01-01"),
      row("vote", "a", 9, 1, 1, "2026-01-01"),
    ];
    const vote = groupInteractions(scrambled).find((g) => g.type === "vote")!;
    expect(vote.partners.map((p) => p.account)).toEqual(["a", "b"]);
  });

  it("marks a present-but-zero type as empty-truncated", () => {
    const rows = [row("follow", null, 0, 1, 0, "2026-07-01")];
    const follow = groupInteractions(rows).find((g) => g.type === "follow")!;
    expect(follow.total).toBe(0);
    expect(follow.hasData).toBe(false);
    expect(follow.emptyTruncated).toBe(true);
    expect(follow.coveredFrom).toBe("2026-07-01");
  });

  it("leaves absent types with null coverage and no data", () => {
    const reblog = groupInteractions(SAMPLE).find((g) => g.type === "reblog")!;
    expect(reblog.total).toBe(0);
    expect(reblog.hasData).toBe(false);
    expect(reblog.emptyTruncated).toBe(false);
    expect(reblog.coveredFrom).toBeNull();
  });

  it("excludes the account itself from every derived figure", () => {
    const rows = [
      row("vote", "actifit", 100, 1, 1, "2026-01-01"),
      row("vote", "carrinm", 20, 2, 1, "2026-01-01"),
      row("vote", null, 5, 3, 4, "2026-01-01"),
    ];
    const vote = groupInteractions(rows, "actifit").find(
      (g) => g.type === "vote"
    )!;
    expect(vote.partners.map((p) => p.account)).toEqual(["carrinm"]);
    // The total every view reads (header, legend, KPIs) drops the self count.
    expect(vote.total).toBe(25);
    expect(vote.hasData).toBe(true);
  });

  it("does not call a self-only type an empty window", () => {
    const selfOnly = groupInteractions(
      [row("vote", "actifit", 100, 1, 1, "2026-01-01")],
      "actifit"
    ).find((g) => g.type === "vote")!;
    expect(selfOnly.total).toBe(0);
    expect(selfOnly.hasData).toBe(false);
    expect(selfOnly.emptyTruncated).toBe(false);
  });

  it("handles undefined/empty input", () => {
    expect(groupInteractions(undefined).every((g) => g.total === 0)).toBe(true);
    expect(groupInteractions([]).length).toBe(INTERACTION_TYPES.length);
  });
});

describe("buildSankey", () => {
  const groups = groupInteractions(SAMPLE);

  it("builds a You → type → partner/Others DAG", () => {
    const { nodes, links } = buildSankey(
      groups,
      labels,
      new Set(INTERACTION_TYPES)
    );
    const names = nodes.map((n) => n.name);
    expect(names).toContain("@actifit");
    expect(names).toContain("reply");
    expect(names).toContain("transfer");
    expect(names).toContain("@carrinm");
    expect(names).toContain("Others");

    // You → reply carries the whole reply total.
    const youReply = links.find(
      (l) => l.source === "@actifit" && l.target === "reply"
    )!;
    expect(youReply.value).toBe(42 + 30 + 3735);

    // reply → Others carries the merged tail and its account count.
    const replyOthers = links.find(
      (l) => l.source === "reply" && l.target === "Others"
    )!;
    expect(replyOthers.value).toBe(3735);
    expect(replyOthers.isOthers).toBe(true);
    expect(replyOthers.othersAccounts).toBe(231);
  });

  it("emits no duplicate nodes and conserves flow per type", () => {
    const { nodes, links } = buildSankey(
      groups,
      labels,
      new Set(INTERACTION_TYPES)
    );
    expect(new Set(nodes.map((n) => n.name)).size).toBe(nodes.length);
    // Sum of a type's outgoing links equals its You→type inflow.
    const inflow = links.find((l) => l.target === "reply")!.value;
    const outflow = links
      .filter((l) => l.source === "reply")
      .reduce((s, l) => s + l.value, 0);
    expect(outflow).toBe(inflow);
  });

  it("mirrors the graph for RTL", () => {
    const { nodes, links } = buildSankey(
      groups,
      labels,
      new Set(INTERACTION_TYPES),
      true
    );
    // The account moves to the right-hand column, partners to the left.
    expect(nodes.find((n) => n.role === "you")!.depth).toBe(2);
    expect(nodes.filter((n) => n.role === "partner")[0].depth).toBe(0);
    expect(nodes.find((n) => n.role === "type")!.depth).toBe(1);

    // Edges reverse with the depths, or every ribbon would draw backwards.
    expect(
      links.some((l) => l.source === "reply" && l.target === "@actifit")
    ).toBe(true);
    expect(
      links.some((l) => l.source === "@carrinm" && l.target === "reply")
    ).toBe(true);

    // Still acyclic: only partner-side nodes have no inbound edge.
    const targets = new Set(links.map((l) => l.target));
    expect(targets.has("@carrinm")).toBe(false);

    // Tooltip metadata survives the flip so it never reads source/target.
    const partnerLink = links.find((l) => l.partner === "carrinm")!;
    expect(partnerLink.value).toBe(42);
  });

  it("respects the active-type filter", () => {
    const { links } = buildSankey(
      groups,
      labels,
      new Set<Hive.AccountInteractionType>(["transfer"])
    );
    expect(links.some((l) => l.interactionType === "reply")).toBe(false);
    expect(links.some((l) => l.interactionType === "transfer")).toBe(true);
  });

  it("drops self-interactions so the graph never cycles", () => {
    // A self-vote names the account as its own partner; kept, it would reuse the
    // source node and ECharts would throw on the cycle.
    const withSelf = groupInteractions([
      row("vote", "actifit", 100, 1, 1, "2026-01-01"),
      row("vote", "carrinm", 20, 2, 1, "2026-01-01"),
      row("vote", null, 5, 3, 4, "2026-01-01"),
    ]);
    const { nodes, links } = buildSankey(
      withSelf,
      labels,
      new Set(INTERACTION_TYPES)
    );
    expect(links.some((l) => l.target === "@actifit")).toBe(false);
    expect(nodes.filter((n) => n.name === "@actifit")).toHaveLength(1);

    // You → vote is resized to what actually flows out (self count excluded).
    const inflow = links.find((l) => l.target === "vote")!.value;
    const outflow = links
      .filter((l) => l.source === "vote")
      .reduce((s, l) => s + l.value, 0);
    expect(inflow).toBe(25);
    expect(outflow).toBe(inflow);
  });

  it("skips a type whose only partner is the account itself", () => {
    const selfOnly = groupInteractions([
      row("vote", "actifit", 100, 1, 1, "2026-01-01"),
    ]);
    const { nodes, links } = buildSankey(
      selfOnly,
      labels,
      new Set(INTERACTION_TYPES)
    );
    expect(links).toEqual([]);
    expect(nodes).toEqual([]);
  });

  it("returns empty data when nothing is active", () => {
    const { nodes, links } = buildSankey(
      groups,
      labels,
      new Set<Hive.AccountInteractionType>()
    );
    expect(nodes).toEqual([]);
    expect(links).toEqual([]);
  });
});

describe("truncatedTypes", () => {
  const groups = groupInteractions(SAMPLE);

  it("flags types whose coverage starts after a requested fixed window", () => {
    // Asked for a year back; replies only cover since 2026-06-18 → truncated,
    // transfers cover since 2016 → within the window.
    const result = truncatedTypes(groups, "2025-07-31");
    expect(result.map((r) => r.type)).toEqual(["reply"]);
    expect(result[0].coveredFrom).toBe("2026-06-18");
  });

  it("uses earliest coverage as the baseline for all-time", () => {
    // Baseline = 2016-03-24 (transfer); reply starts later → truncated.
    const result = truncatedTypes(groups, null);
    expect(result.map((r) => r.type)).toEqual(["reply"]);
  });

  it("flags nothing when the window is fully covered", () => {
    expect(truncatedTypes(groups, "2026-06-25")).toEqual([]);
  });
});
