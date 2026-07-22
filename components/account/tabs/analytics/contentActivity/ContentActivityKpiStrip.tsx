import React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import { formatCompact, computeTrendPct } from "@/utils/chartUtils";
import { FilledRow, RewardRow, ActivityView } from "./contentActivityUtils";

interface ContentActivityKpiStripProps {
  rows: FilledRow[];
  rewardRows: RewardRow[];
  view: ActivityView;
}

const TrendBadge: React.FC<{ pct: number | null; locale: string }> = ({
  pct,
  locale,
}) => {
  const sign = pct === null ? 0 : pct > 0 ? 1 : pct < 0 ? -1 : 0;
  const Icon = sign > 0 ? TrendingUp : sign < 0 ? TrendingDown : Minus;
  const color =
    sign > 0
      ? "text-explorer-light-green"
      : sign < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-gray-500";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold leading-none",
        color
      )}
    >
      <Icon className="h-3 w-3" />
      {pct !== null
        ? `${pct >= 0 ? "+" : ""}${pct.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
        : "—"}
    </span>
  );
};

const KpiTile: React.FC<{
  label: string;
  value: string;
  pct: number | null;
  dotColor: string;
  locale: string;
}> = ({ label, value, pct, dotColor, locale }) => (
  <div className="flex-1 min-w-[110px] rounded-lg border border-gray-200 dark:border-gray-700 bg-explorer-extra-light-gray px-3 py-2 shadow-sm">
    <div className="flex items-center gap-1.5 mb-1">
      <span
        className="inline-block h-2 w-2 rounded-[2px] shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 break-words">
        {label}
      </span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-lg font-bold leading-none text-explorer-dark-gray dark:text-text">
        {value}
      </span>
      <TrendBadge pct={pct} locale={locale} />
    </div>
  </div>
);

const ContentActivityKpiStrip: React.FC<ContentActivityKpiStripProps> = ({
  rows,
  rewardRows,
  view,
}) => {
  const { t, locale } = useI18n();

  // Totals and trend use completed periods only; the in-progress period is still
  // accruing and would understate the latest bucket.
  const completed = rows.filter((r) => !r.isCurrent);
  const completedRewards = rewardRows.filter((r) => !r.isCurrent);
  const base = completed.length ? completed : rows;
  const rewardBase = completedRewards.length ? completedRewards : rewardRows;

  const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0);

  const tiles =
    view === "rewards"
      ? [
          {
            label: t("contentActivity.rewardHive"),
            value: formatCompact(sum(rewardBase.map((r) => r.hive)), locale),
            pct: computeTrendPct(rewardBase.map((r) => r.hive)),
            dotColor: "#e11d48",
          },
          {
            label: t("contentActivity.rewardHbd"),
            value: formatCompact(sum(rewardBase.map((r) => r.hbd)), locale),
            pct: computeTrendPct(rewardBase.map((r) => r.hbd)),
            dotColor: "#10b981",
          },
          {
            label: t("contentActivity.rewardHp"),
            value: formatCompact(sum(rewardBase.map((r) => r.hp)), locale),
            pct: computeTrendPct(rewardBase.map((r) => r.hp)),
            dotColor: "#6366f1",
          },
        ]
      : [
          {
            label: t("contentActivity.posts"),
            value: formatCompact(sum(base.map((r) => r.posts)), locale),
            pct: computeTrendPct(base.map((r) => r.posts)),
            dotColor: "#6366f1",
          },
          {
            label: t("contentActivity.comments"),
            value: formatCompact(sum(base.map((r) => r.comments)), locale),
            pct: computeTrendPct(base.map((r) => r.comments)),
            dotColor: "#14b8a6",
          },
          {
            label: t("contentActivity.repliesReceived"),
            value: formatCompact(
              sum(base.map((r) => r.replies_received)),
              locale
            ),
            pct: computeTrendPct(base.map((r) => r.replies_received)),
            dotColor: "#f59e0b",
          },
          {
            label: t("contentActivity.votesCast"),
            value: formatCompact(sum(base.map((r) => r.votes_cast)), locale),
            pct: computeTrendPct(base.map((r) => r.votes_cast)),
            dotColor: "#8b5cf6",
          },
          {
            label: t("contentActivity.votesReceived"),
            value: formatCompact(
              sum(base.map((r) => r.votes_received)),
              locale
            ),
            pct: computeTrendPct(base.map((r) => r.votes_received)),
            dotColor: "#ec4899",
          },
        ];

  return (
    <div className="flex flex-wrap gap-2">
      {tiles.map((tile) => (
        <KpiTile key={tile.label} {...tile} locale={locale} />
      ))}
    </div>
  );
};

export default ContentActivityKpiStrip;
