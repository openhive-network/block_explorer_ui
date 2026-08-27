import { isBadActor } from "./badActors";

// Curated known-account map; ship only verifiable treasury/burn or documented
// exchange wallets — better unbadged than mislabeled.
export type AccountLabelType =
  | "exchange"
  | "treasury"
  | "burn"
  | "witness"
  | "service"
  | "badActor";

export interface AccountLabel {
  type: AccountLabelType;
  label: string;
  status?: "inactive"; // defunct/dormant exchange wallet — shown struck-through
}

const CURATED_LABELS: Record<string, AccountLabel> = {
  "hive.fund": { type: "treasury", label: "DHF" },
  "steem.dao": { type: "treasury", label: "DHF" },
  null: { type: "burn", label: "Burn" },
  "cold.dunamu": { type: "exchange", label: "Upbit (Dunamu)" },
  upbitshotwallet1: { type: "exchange", label: "Upbit" },
  upbitshotwallet2: { type: "exchange", label: "Upbit" },
  upbitshotwallet3: { type: "exchange", label: "Upbit" },
  "binance-hot": { type: "exchange", label: "Binance" },
  "binance-hot2": { type: "exchange", label: "Binance" },
  deepcrypto8: { type: "exchange", label: "Binance (legacy)" },
  bittrex: { type: "exchange", label: "Bittrex", status: "inactive" },
  "huobi-pro": { type: "exchange", label: "Huobi (HTX)" },
  "htx-withdraw-1": { type: "exchange", label: "HTX (Huobi)" },
  mxchive: { type: "exchange", label: "MEXC" },
  gateiodeposit: { type: "exchange", label: "Gate.io" },
  "gopax-deposit": { type: "exchange", label: "GOPAX" },
  bithumbsend4: { type: "exchange", label: "Bithumb" },
  indodaxhive: { type: "exchange", label: "Indodax" },
  "hitbtc-payout": { type: "exchange", label: "HitBTC", status: "inactive" },
  bitgethive: { type: "exchange", label: "Bitget" },
  ionomy: { type: "exchange", label: "Ionomy", status: "inactive" },
  poloniex: { type: "exchange", label: "Poloniex", status: "inactive" },
  bdhivesteem: { type: "exchange", label: "Binance" },
  steembasicincome: { type: "service", label: "Basic Income" },
  "honey-swap": { type: "service", label: "Honey Swap" },
  "graphene-swap": { type: "service", label: "Graphene Swap" },
  "vsc.gateway": { type: "service", label: "VSC Gateway" },
};

// Null-prototype: names reach this map straight from user input.
export const ACCOUNT_LABELS: Record<string, AccountLabel> = Object.assign(
  Object.create(null),
  CURATED_LABELS
);

export interface ResolvedAccountLabel {
  type: AccountLabelType;
  label: string;
  tooltipKey: string;
  status?: "inactive";
}

const TOOLTIP_KEY_BY_TYPE: Record<AccountLabelType, string> = {
  exchange: "accountLabel.exchangeInfo",
  treasury: "accountLabel.treasuryInfo",
  burn: "accountLabel.burnInfo",
  witness: "accountLabel.witnessInfo",
  service: "accountLabel.serviceInfo",
  badActor: "accountMainCard.badActorMessage",
};

// Static label wins; witness is a low-priority dynamic fallback.
export const resolveAccountLabel = (
  account: string,
  opts?: { isWitness?: boolean }
): ResolvedAccountLabel | null => {
  const stat = ACCOUNT_LABELS[account];
  if (stat) {
    return {
      type: stat.type,
      label: stat.label,
      tooltipKey: TOOLTIP_KEY_BY_TYPE[stat.type],
      status: stat.status,
    };
  }
  if (opts?.isWitness) {
    return {
      type: "witness",
      label: "",
      tooltipKey: TOOLTIP_KEY_BY_TYPE.witness,
    };
  }
  return null;
};

// Orthogonal to the curated label above — an account can be both a known
// exchange and community-flagged, so this resolves separately.
export const resolveBadActorLabel = (
  account: string
): ResolvedAccountLabel | null =>
  isBadActor(account)
    ? { type: "badActor", label: "", tooltipKey: TOOLTIP_KEY_BY_TYPE.badActor }
    : null;
