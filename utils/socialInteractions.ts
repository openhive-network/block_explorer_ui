import Hive from "@/types/Hive";

// Fixed display order; unit is always interaction count (never amounts/HP).
export const INTERACTION_TYPES: Hive.AccountInteractionType[] = [
  "reply",
  "vote",
  "transfer",
  "reblog",
  "follow",
];

// One hue per type, assigned by identity (never by rank).
export const INTERACTION_TYPE_COLORS: Record<
  Hive.AccountInteractionType,
  string
> = {
  reply: "#6366f1", // indigo
  vote: "#10b981", // emerald
  transfer: "#f59e0b", // amber
  reblog: "#ec4899", // pink
  follow: "#06b6d4", // cyan
};

export const YOU_NODE_COLOR = "#94a3b8";
export const OTHERS_NODE_COLOR = "#64748b";
// Partners are neutral so the gradient ribbon reads type-hue → partner-grey.
export const PARTNER_NODE_COLOR = "#9aa4b2";

export interface InteractionPartner {
  account: string;
  count: number;
  rank: number;
}

export interface InteractionTypeGroup {
  type: Hive.AccountInteractionType;
  total: number; // named partners + Others band (empty-truncated => 0)
  partners: InteractionPartner[];
  othersCount: number;
  othersAccounts: number; // partners_merged of the Others band
  coveredFrom: string | null; // YYYY-MM-DD, or null if the type is absent
  hasData: boolean;
  emptyTruncated: boolean; // present in the window but zero interactions
}

// Fold flat rows into one group per type: Top-N named partners + a partner:null
// "Others" band (a partner:null row with count 0 marks an empty window).
// `excludeAccount` drops self-interactions here, at the single source every view
// reads, so the flow, table, KPIs and legend counts can't disagree.
export function groupInteractions(
  rows: Hive.AccountInteractionRow[] | undefined,
  excludeAccount?: string
): InteractionTypeGroup[] {
  const byType = new Map<
    Hive.AccountInteractionType,
    Hive.AccountInteractionRow[]
  >();
  (rows ?? []).forEach((r) => {
    const list = byType.get(r.interaction_type) ?? [];
    list.push(r);
    byType.set(r.interaction_type, list);
  });

  return INTERACTION_TYPES.map((type) => {
    const list = byType.get(type) ?? [];
    const coveredFrom = list.length ? list[0].covered_from : null;

    const partners: InteractionPartner[] = list
      .filter(
        (r) =>
          r.partner !== null &&
          r.partner !== excludeAccount &&
          r.interaction_count > 0
      )
      .map((r) => ({
        account: r.partner as string,
        count: r.interaction_count,
        rank: r.partner_rank,
      }))
      .sort((a, b) => a.rank - b.rank);

    const othersRow = list.find(
      (r) => r.partner === null && r.interaction_count > 0
    );
    const othersCount = othersRow?.interaction_count ?? 0;
    const othersAccounts = othersRow?.partners_merged ?? 0;

    const total = partners.reduce((sum, p) => sum + p.count, 0) + othersCount;
    // Measured before exclusion: a self-only type is not an empty window.
    const rawTotal = list.reduce((sum, r) => sum + r.interaction_count, 0);

    return {
      type,
      total,
      partners,
      othersCount,
      othersAccounts,
      coveredFrom,
      hasData: total > 0,
      emptyTruncated: list.length > 0 && rawTotal === 0,
    };
  });
}

// Role, not depth, identifies a node: RTL swaps the depths but not the roles.
export type SankeyNodeRole = "you" | "type" | "partner";

export interface SankeyNode {
  name: string;
  role: SankeyNodeRole;
  depth?: number;
  itemStyle?: { color: string };
  label?: { position?: "left" | "right"; fontWeight?: string };
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  lineStyle?: { color: string; opacity: number };
  // Edge-tooltip metadata; ignored by ECharts. `partner` is set on the ribbons
  // that land on a named partner, so the tooltip never has to guess which end
  // of source/target holds the account — RTL reverses them.
  interactionType: Hive.AccountInteractionType;
  isOthers: boolean;
  othersAccounts?: number;
  partner?: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyLabels {
  you: string; // display name of the source node, e.g. "@alice"
  others: string; // localized "Others"
  typeLabel: (type: Hive.AccountInteractionType) => string;
}

// Build a 3-stage DAG (You → type → partners/Others). Partner nodes are keyed
// by account so a partner reached through several types is one shared node.
export function buildSankey(
  groups: InteractionTypeGroup[],
  labels: SankeyLabels,
  activeTypes: Set<Hive.AccountInteractionType>,
  rtl = false
): SankeyData {
  const activeGroups = groups.filter(
    (g) => g.hasData && activeTypes.has(g.type)
  );
  if (activeGroups.length === 0) return { nodes: [], links: [] };

  // ECharts sankey always flows left→right, so an RTL locale mirrors the graph:
  // the account sits on the right and the columns run outward to the left. That
  // means swapping the depths AND the edge direction — laying the source on the
  // right while edges still point right would draw every ribbon backwards.
  const youDepth = rtl ? 2 : 0;
  const partnerDepth = rtl ? 0 : 2;
  // Terminal labels point inward so long @usernames stay inside the plot.
  const partnerLabelPos = rtl ? ("right" as const) : ("left" as const);
  const youLabelPos = rtl ? ("left" as const) : ("right" as const);
  // Ribbons are drawn source→target, so RTL reverses every edge.
  const edge = (from: string, to: string) =>
    rtl ? { source: to, target: from } : { source: from, target: to };

  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  const seen = new Set<string>();
  const addNode = (
    name: string,
    role: SankeyNodeRole,
    depth: number,
    color?: string,
    labelPos?: "left" | "right"
  ) => {
    if (seen.has(name)) return;
    seen.add(name);
    nodes.push({
      name,
      role,
      depth,
      ...(color ? { itemStyle: { color } } : {}),
      ...(labelPos ? { label: { position: labelPos } } : {}),
    });
  };

  addNode(labels.you, "you", youDepth, YOU_NODE_COLOR, youLabelPos);
  let othersUsed = false;

  activeGroups.forEach((g) => {
    // Drop self-interactions: the account as its own partner makes the graph
    // cyclic and ECharts throws on a sankey cycle. Size You→type from the rest.
    const partners = g.partners.filter((p) => `@${p.account}` !== labels.you);
    const total = partners.reduce((sum, p) => sum + p.count, 0) + g.othersCount;
    if (total <= 0) return;

    const color = INTERACTION_TYPE_COLORS[g.type];
    const typeName = labels.typeLabel(g.type);
    addNode(typeName, "type", 1, color);
    links.push({
      ...edge(labels.you, typeName),
      value: total,
      interactionType: g.type,
      isOthers: false,
    });

    partners.forEach((p) => {
      const partnerName = `@${p.account}`;
      addNode(
        partnerName,
        "partner",
        partnerDepth,
        PARTNER_NODE_COLOR,
        partnerLabelPos
      );
      links.push({
        ...edge(typeName, partnerName),
        value: p.count,
        interactionType: g.type,
        isOthers: false,
        partner: p.account,
      });
    });

    if (g.othersCount > 0) {
      othersUsed = true;
      links.push({
        ...edge(typeName, labels.others),
        value: g.othersCount,
        interactionType: g.type,
        isOthers: true,
        othersAccounts: g.othersAccounts,
      });
    }
  });

  // All active types drew nothing (e.g. self-only) → empty graph.
  if (links.length === 0) return { nodes: [], links: [] };
  if (othersUsed) {
    addNode(
      labels.others,
      "partner",
      partnerDepth,
      OTHERS_NODE_COLOR,
      partnerLabelPos
    );
  }

  return { nodes, links };
}

export interface TruncatedType {
  type: Hive.AccountInteractionType;
  coveredFrom: string;
}

// Flag types whose data starts after the requested window (so a truncated series
// is never shown as "all-time"). Baseline: the from-date, or earliest coverage.
export function truncatedTypes(
  groups: InteractionTypeGroup[],
  requestedFrom: string | null
): TruncatedType[] {
  const withData = groups.filter(
    (g): g is InteractionTypeGroup & { coveredFrom: string } =>
      g.coveredFrom !== null
  );
  if (!withData.length) return [];

  const baseline =
    requestedFrom ??
    withData.reduce(
      (min, g) => (g.coveredFrom < min ? g.coveredFrom : min),
      withData[0].coveredFrom
    );

  return withData
    .filter((g) => g.coveredFrom > baseline)
    .map((g) => ({ type: g.type, coveredFrom: g.coveredFrom }));
}
