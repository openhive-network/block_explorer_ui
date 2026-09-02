// One spelling per entity: gSSP redirects to the normalized id so a block/tx cannot self-compete.

export type EntityIdKind = "number" | "hash" | "invalid";

export interface NormalizedEntityId {
  normalized: string;
  kind: EntityIdKind;
}

const HEX_40 = /^[0-9a-f]{40}$/i;

const INVALID: NormalizedEntityId = { normalized: "", kind: "invalid" };

// Hive mints ~10.5M blocks a year and is under 100M, so 10 digits covers roughly
// the next 900 years. Beyond that the id is bogus by construction, and without a
// bound "/block/<any digits>" is an infinite space of indexable thin pages.
const MAX_BLOCK_DIGITS = 10;

export const normalizeBlockId = (raw: string): NormalizedEntityId => {
  if (HEX_40.test(raw)) return { normalized: raw.toLowerCase(), kind: "hash" };
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
