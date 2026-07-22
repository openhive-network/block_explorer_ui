import {
  AccountCardData,
  AccountCardStat,
  AccountCardBadge,
} from "./accountCardSvg";

// "Earned · 1Y" counts only genuine author + curation rewards — NOT benefactor
// or witness block-production rewards (which also carry "reward" in their op
// name) — so the figure matches its "author + curation" label for every account.
export const AUTHOR_CURATION_CATEGORIES = [
  "author_reward_operation",
  "curation_reward_operation",
];

// Sum author + curation reward VESTS (nai, i.e. ×1e6) across financial-summary
// rows. Shared by both card paths so the definition can't drift.
export const sumAuthorCurationVests = (
  rows:
    | { category?: string; direction?: string; vests_nai?: number | string }[]
    | undefined
): number =>
  (rows ?? []).reduce(
    (sum, r) =>
      r.direction === "incoming" &&
      AUTHOR_CURATION_CATEGORIES.includes(r.category ?? "")
        ? sum + (Number(r.vests_nai) || 0)
        : sum,
    0
  );

// Compact number formatting shared by both card paths (12.1M, $831.3K, 45.3K).
export const compactNumber = (n: number, locale: string): string =>
  Math.abs(n) >= 1000
    ? n.toLocaleString(locale, {
        notation: "compact",
        maximumFractionDigits: 1,
      })
    : n.toLocaleString(locale, { maximumFractionDigits: 0 });

// Everything the card renders, already reduced to plain numbers/flags. Both the
// in-app popup and the server OG route assemble this from their own data source,
// then call buildAccountCardData so the two cards can never diverge in shaping.
export interface AccountCardInputs {
  accountName: string;
  avatarHref: string;
  brandLogoHref: string;
  reputation: number;
  hp: number;
  accountValue?: number;
  followers: number;
  posts: number;
  earnedHp?: number;
  isWitness: boolean;
  witnessRank?: number | null;
  voteWeightHp?: number;
  voters?: number;
  stakeRank?: number | null;
  created?: Date | null;
  hpTrend?: number;
  sparkline?: number[];
  rtl?: boolean;
  brand?: string;
}

type T = (key: string, options?: Record<string, unknown>) => string;

export const buildAccountCardData = (
  inp: AccountCardInputs,
  t: T,
  locale: string
): AccountCardData => {
  const c = (n: number) => compactNumber(n, locale);

  const monthYear = inp.created
    ? inp.created.toLocaleString(locale, { month: "long", year: "numeric" })
    : null;
  const years = inp.created
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - inp.created.getTime()) / (365.25 * 24 * 3600 * 1000)
        )
      )
    : null;

  const isWit = inp.isWitness;
  const followers = inp.followers || 0;
  const posts = inp.posts || 0;
  const voters = inp.voters ?? 0;
  const accountValue = inp.accountValue ?? 0;

  const rolePieces = [
    isWit ? t("accountShareCard.witness") : null,
    monthYear ? t("accountShareCard.joined", { date: monthYear }) : null,
  ].filter(Boolean) as string[];

  const witnessRank = isWit && inp.witnessRank ? inp.witnessRank : null;
  const stakeRank = inp.stakeRank ?? null;

  const badges: AccountCardBadge[] = [
    witnessRank
      ? {
          icon: "crown",
          text: t("accountShareCard.topWitness", { rank: witnessRank }),
        }
      : isWit
        ? { icon: "crown", text: t("accountShareCard.witness") }
        : null,
    stakeRank
      ? {
          icon: "gem",
          text: t("accountShareCard.stakeRank", { rank: stakeRank }),
        }
      : null,
    { icon: "pen", text: `${c(posts)} ${t("accountShareCard.posts")}` },
  ].filter(Boolean) as AccountCardBadge[];

  const hpStat: AccountCardStat = {
    label: t("accountShareCard.hivePower"),
    value: c(Math.round(inp.hp)),
    accent: "#7dffb0",
    ...(inp.hpTrend !== undefined && Math.abs(inp.hpTrend) >= 0.5
      ? {
          delta: `${inp.hpTrend >= 0 ? "▲" : "▼"}${Math.abs(inp.hpTrend).toFixed(0)}%`,
          deltaUp: inp.hpTrend >= 0,
        }
      : {}),
  };
  const valueStat: AccountCardStat | null =
    accountValue > 0
      ? {
          label: t("accountShareCard.accountValue"),
          value: `$${c(accountValue)}`,
        }
      : null;
  const followersStat: AccountCardStat = {
    label: t("accountShareCard.followers"),
    value: c(followers),
  };
  const earnedStat: AccountCardStat | null = inp.earnedHp
    ? {
        label: t("accountShareCard.earned"),
        value: c(inp.earnedHp),
        sub: t("accountShareCard.authorCuration"),
      }
    : null;

  // Same lower stats row for witness and non-witness accounts, so the card
  // layout stays consistent regardless of witness status.
  const stats: (AccountCardStat | null)[] = [
    hpStat,
    valueStat,
    followersStat,
    earnedStat,
  ];

  // Witness-specific metrics render as a separate, right-aligned upper block.
  const witnessMetrics = isWit
    ? ([
        inp.voteWeightHp
          ? {
              value: c(Math.round(inp.voteWeightHp)),
              label: `${t("accountShareCard.voteWeight")} (${t("accountShareCard.hp")})`,
            }
          : null,
        { value: c(voters), label: t("accountShareCard.witnessVoters") },
      ].filter(Boolean) as { value: string; label: string }[])
    : undefined;

  return {
    name: inp.accountName,
    avatarHref: inp.avatarHref,
    reputation: Math.round(Number(inp.reputation) || 0),
    role: rolePieces.join(" · "),
    tenure: years !== null ? t("accountShareCard.tenure", { years }) : "",
    isWitness: isWit,
    badges,
    stats: stats.filter(Boolean).slice(0, 4) as AccountCardData["stats"],
    witnessMetrics,
    sparkline: inp.sparkline,
    rtl: inp.rtl,
    brand: inp.brand ?? "hivescan.info",
    brandLogoHref: inp.brandLogoHref,
    ctaLabel: t("accountShareCard.cta"),
  };
};
