import { i18nRef } from "@/components/dashboard/templates";

export type SeedColumn = "left" | "main" | "right";

export interface WidgetSeed {
  type: string;
  // Suffix of the localStorage flag. These are live in users' browsers — never
  // rename one, or the widget is seeded a second time for everyone.
  flag: string;
  column: SeedColumn;
  // Placed directly below this widget when present, otherwise at the bottom of
  // the column.
  anchor?: string;
  // Fixed width, for seeds that must not inherit a resized anchor's width.
  w?: number;
  h: number;
  minH: number;
  // Full-width band pinned to row 0 rather than placed in a column.
  masthead?: boolean;
  state?: Record<string, unknown>;
}

export const COLUMN_X: Record<SeedColumn, number> = {
  left: 0,
  main: 3,
  right: 9,
};

export const COLUMN_W: Record<SeedColumn, number> = {
  left: 3,
  main: 6,
  right: 3,
};

export const inColumn = (column: SeedColumn, x: number) =>
  column === "left" ? x < 3 : column === "main" ? x >= 3 && x < 9 : x >= 9;

// Order matters: a seed anchored to another must come after it, so the anchor
// exists by the time it is placed.
export const WIDGET_SEEDS: WidgetSeed[] = [
  {
    type: "board-header",
    flag: "my_board_header",
    column: "main",
    masthead: true,
    h: 2,
    minH: 1,
    state: {
      eyebrow: i18nRef("boards.myBoard.eyebrow"),
      title: i18nRef("boards.myBoard.name"),
      subtitle: i18nRef("boards.myBoard.subtitle"),
      icon: "board",
      accent: "rose",
    },
  },
  {
    type: "network-growth",
    flag: "network_growth",
    column: "main",
    h: 3.3,
    minH: 3,
  },
  { type: "hp-momentum", flag: "hp_momentum", column: "main", h: 9, minH: 6 },
  {
    type: "daily-active-users",
    flag: "daily_active_users",
    column: "main",
    anchor: "network-growth",
    h: 3.3,
    minH: 3,
  },
  {
    type: "op-mix",
    flag: "op_mix",
    column: "main",
    anchor: "daily-active-users",
    h: 3.3,
    minH: 3,
  },
  {
    type: "top-accounts",
    flag: "top_accounts",
    column: "right",
    anchor: "top-witnesses",
    w: 3,
    h: 11,
    minH: 8,
  },
  {
    type: "voting-activity",
    flag: "voting_activity",
    column: "left",
    anchor: "blockchain-dates",
    w: 3,
    h: 5.8,
    minH: 4,
  },
  {
    type: "network-hp-distribution",
    flag: "network_hp_distribution",
    column: "left",
    anchor: "voting-activity",
    w: 3,
    h: 7,
    minH: 5,
  },
  {
    type: "account-retention-funnel",
    flag: "account_retention_funnel",
    column: "main",
    anchor: "daily-active-users",
    h: 3.3,
    minH: 3,
  },
  {
    type: "network-content-volume",
    flag: "network_content_volume",
    column: "main",
    anchor: "hp-momentum",
    h: 5,
    minH: 4,
  },
  {
    type: "network-engagement",
    flag: "network_engagement",
    column: "main",
    anchor: "op-mix",
    h: 5,
    minH: 4,
  },
  {
    type: "network-rc-utilization",
    flag: "network_rc_utilization",
    column: "main",
    anchor: "op-mix",
    h: 3.3,
    minH: 3,
  },
  {
    type: "network-dapp-usage",
    flag: "network_dapp_usage",
    column: "main",
    anchor: "network-content-volume",
    h: 7,
    minH: 5,
  },
];

export const seedStorageKey = (flag: string, username: string) =>
  `hivescan_dashboard_${flag}_seeded_${username}`;

export const watchedProposalsDismissedKey = (username: string) =>
  `hivescan_dashboard_watched_proposals_dismissed_${username}`;
