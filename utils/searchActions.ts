import moment from "moment";

import { convertIdsToBooleanArray } from "@/lib/utils";
import { dataToURL } from "@/utils/URLutils";

// Operation type ids (fixed by the protocol).
const TRANSFER_OP_ID = 2;
// Paid to the witness that produced the block, and to nobody else. The
// blocks page's account filter alone also matches blocks the account only
// appears in.
const PRODUCER_REWARD_OP_ID = 64;
const RECENT_DAYS = 7;

export type SearchActionKey =
  | "operations"
  | "transfers"
  | "comments"
  | "balanceHistory"
  | "blocksProduced"
  | "proposals"
  | "blocksUpTo"
  | "proposal";

export interface SearchAction {
  key: SearchActionKey;
  href: string;
  // The action searches the last RECENT_DAYS days.
  recent?: boolean;
}

export interface SearchActionOptions {
  isWitness?: boolean;
  proposals?: boolean;
  // For the "last 7 days" ranges; the tests pin it.
  now?: Date;
}

const withQuery = (path: string, query: Record<string, string | number>) =>
  `${path}?${new URLSearchParams(
    Object.entries(query).map(([key, value]) => [key, String(value)])
  )}`;

// The range the pages' own "last 7 days" choice writes to the URL.
const lastDays = (now: Date, dateKey: "fromDate" | "startDate") => ({
  rangeSelectKey: "lastTime",
  lastTime: RECENT_DAYS,
  timeUnit: "days",
  [dateKey]: dataToURL(
    moment(now).subtract(RECENT_DAYS, "days").milliseconds(0).toDate()
  ),
});

// Ready-made searches for an account, each opening an existing page with
// the search filled in. The account's own row already opens its profile.
export const accountActions = (
  account: string,
  {
    isWitness = false,
    proposals = false,
    now = new Date(),
  }: SearchActionOptions = {}
): SearchAction[] => {
  const profile = `/@${account}`;
  const actions: SearchAction[] = [
    {
      key: "operations",
      href: withQuery(profile, lastDays(now, "fromDate")),
      recent: true,
    },
    {
      key: "transfers",
      href: withQuery(profile, {
        filters: dataToURL(convertIdsToBooleanArray([TRANSFER_OP_ID])),
        ...lastDays(now, "fromDate"),
      }),
      recent: true,
    },
    { key: "comments", href: withQuery(profile, { activeTab: "comments" }) },
    {
      key: "balanceHistory",
      href: withQuery(profile, { activeTab: "balance-history" }),
    },
  ];
  if (proposals)
    actions.push({
      key: "proposals",
      href: withQuery("/proposals", { q: account }),
    });
  // Last: the witness list can arrive after the others are on screen, and
  // adding a row above a highlighted one would move the highlight.
  if (isWitness)
    actions.push({
      key: "blocksProduced",
      href: withQuery("/blocks", {
        accountName: account,
        filters: dataToURL(convertIdsToBooleanArray([PRODUCER_REWARD_OP_ID])),
        ...lastDays(now, "startDate"),
      }),
      recent: true,
    });
  return actions;
};

// A block number also reads as a proposal id while it's in proposal range
// (ids are in the hundreds and grow by a few dozen a year).
const MAX_PROPOSAL_ID = 2000;

export const blockNumberActions = (
  blockNum: string,
  { proposals = false }: SearchActionOptions = {}
): SearchAction[] => {
  const actions: SearchAction[] = [
    {
      key: "blocksUpTo",
      href: withQuery("/blocks", {
        rangeSelectKey: "blockRange",
        toBlock: blockNum,
      }),
    },
  ];
  if (proposals && Number(blockNum) < MAX_PROPOSAL_ID)
    actions.push({
      key: "proposal",
      href: withQuery("/proposals", { q: blockNum }),
    });
  return actions;
};
