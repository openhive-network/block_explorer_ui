// Row model for the head-to-head account comparison (/compare?a=&b=).
// The data hook shapes every metric into these rows; the pure scoring helpers
// (scoring.ts) and the presentation components consume them.

export type Side = "a" | "b";

// null = the row can't be scored (unscored/neutral metric, or missing data).
export type Winner = Side | "tie" | null;

export type ValueFormat =
  | "usd"
  | "hp"
  | "hbd"
  | "hive"
  | "number"
  | "reputation"
  | "rank"
  | "date"
  | "percent"
  | "text";

export interface CompareRow {
  id: string;
  labelKey: string;
  subLabelKey?: string;
  format: ValueFormat;
  // Winner-highlighted when true; neutral (shown, not scored) when false.
  scored: boolean;
  // Rank, power-down, etc. — the smaller value wins.
  lowerWins?: boolean;
  // Raw comparable numbers; null means unavailable for that side.
  aValue: number | null;
  bValue: number | null;
  // Optional pre-formatted display that overrides numeric formatting
  // (e.g. a top dapp name, "—").
  aDisplay?: string;
  bDisplay?: string;
  // i18n key whose translation replaces the value entirely (the governance-health
  // buckets). Takes precedence over aDisplay/bDisplay.
  aDisplayKey?: string;
  bDisplayKey?: string;
  // Optional muted secondary value under the primary (e.g. delegation HP under
  // the delegation count). Does not affect scoring.
  aSecondary?: number | null;
  bSecondary?: number | null;
  secondaryFormat?: ValueFormat;
  // Node-gated windowed row whose source the active node doesn't serve — render
  // an "Unavailable" placeholder instead of values, and never score it.
  unavailable?: boolean;
}

export interface CompareSection {
  id: string;
  titleKey: string;
  rows: CompareRow[];
  // Windowed sections show the active range label (e.g. "30D") in their header.
  windowed?: boolean;
}
