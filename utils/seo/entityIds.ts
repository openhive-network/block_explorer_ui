// One spelling per entity: gSSP redirects to the normalized id so a block/tx cannot self-compete.

export type EntityIdKind = "number" | "hash" | "time" | "invalid";

export interface NormalizedEntityId {
  normalized: string;
  kind: EntityIdKind;
}

const HEX_40 = /^[0-9a-f]{40}$/i;

// The block page's date jump navigates to /block/<Date.toISOString()>.
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

// Block 1's timestamp: hafah has no block for anything earlier.
const GENESIS_MS = Date.UTC(2016, 2, 24, 16, 5, 0);
// A date jump may pick a time later today; anything further out is a made-up URL.
const FUTURE_SLACK_MS = 24 * 60 * 60 * 1000;

// A timestamp hafah can answer: a real calendar time (Date.parse rolls
// 2026-02-30 over to Mar 2 and 24:00 to the next day, but hafah rejects both),
// from block 1 up to about now.
const isBlockTime = (raw: string): boolean => {
  if (!ISO_UTC.test(raw)) return false;
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) return false;
  if (new Date(ms).toISOString().slice(0, 19) !== raw.slice(0, 19))
    return false;
  return ms >= GENESIS_MS && ms <= Date.now() + FUTURE_SLACK_MS;
};

const INVALID: NormalizedEntityId = { normalized: "", kind: "invalid" };

// Hive mints ~10.5M blocks a year and is under 100M, so 10 digits covers roughly
// the next 900 years. Beyond that the id is bogus by construction, and without a
// bound "/block/<any digits>" is an infinite space of indexable thin pages.
const MAX_BLOCK_DIGITS = 10;

export const normalizeBlockId = (raw: string): NormalizedEntityId => {
  if (HEX_40.test(raw)) return { normalized: raw.toLowerCase(), kind: "hash" };
  if (isBlockTime(raw)) return { normalized: raw, kind: "time" };
  const digits = raw.replace(/[,\s]/g, "");
  if (!/^\d+$/.test(digits)) return INVALID;
  const normalized = digits.replace(/^0+(?=\d)/, "");
  // Block numbering starts at 1, so "0" is not a block either.
  if (normalized === "0" || normalized.length > MAX_BLOCK_DIGITS)
    return INVALID;
  return { normalized, kind: "number" };
};

export const normalizeTransactionId = (raw: string): NormalizedEntityId =>
  HEX_40.test(raw) ? { normalized: raw.toLowerCase(), kind: "hash" } : INVALID;

const ACCOUNT_NAME = /^[a-z][a-z0-9.-]{2,15}$/;

export const isAccountName = (name: string): boolean => ACCOUNT_NAME.test(name);

// Keeps a 40-char hash from blowing past the ~60 char title budget.
export const shortHex = (hex: string, keep = 12): string =>
  hex.length > keep ? `${hex.slice(0, keep)}…` : hex;

// gSSP redirects drop the query string, which would discard the /block operation filters.
export const queryStringOf = (resolvedUrl: string): string => {
  const i = resolvedUrl.indexOf("?");
  return i === -1 ? "" : resolvedUrl.slice(i);
};
