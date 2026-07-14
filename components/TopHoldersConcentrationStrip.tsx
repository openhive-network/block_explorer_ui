import React, { useMemo } from "react";
import Link from "next/link";
import { Info, Database, Crown, Trophy, Users, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import useTopHoldersConcentration from "@/hooks/api/common/useTopHoldersConcentration";
import { CoinType, BalanceType } from "@/hooks/api/common/useTopHolders";
import { formatCompact, formatSharePct } from "@/utils/chartUtils";
import { isSystemAccount } from "@/utils/systemAccounts";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  coinType: CoinType;
  balanceType: BalanceType;
  totalSupplyRaw: number | null;
  baseRaw: number | null; // circulating balance-type denominator (excl. treasury/burn)
}

const TopHoldersConcentrationStrip: React.FC<Props> = ({
  coinType,
  balanceType,
  totalSupplyRaw,
  baseRaw,
}) => {
  const { t, locale } = useI18n();
  const { holders, isLoading } = useTopHoldersConcentration(
    coinType,
    balanceType
  );

  const stats = useMemo(() => {
    const real = holders.filter((h) => !isSystemAccount(h.account));
    const values = real.map((h) => Number(h.value) || 0);
    // Page-computed circulating denominator (see getCirculatingBaseRaw).
    const supply = baseRaw ?? 0;
    const pctOf = (sum: number) => (supply > 0 ? Math.min(1, sum / supply) : 0);
    const sumTop = (n: number) => values.slice(0, n).reduce((a, b) => a + b, 0);
    let cum = 0;
    let nakamoto: number | null = null;
    for (let i = 0; i < values.length; i++) {
      cum += values[i];
      if (supply > 0 && cum / supply >= 0.51) {
        nakamoto = i + 1;
        break;
      }
    }
    return {
      largestPct: pctOf(values[0] ?? 0),
      largestAccount: real[0]?.account ?? null,
      top10Pct: pctOf(sumTop(10)),
      top100Pct: pctOf(sumTop(100)),
      nakamoto,
      sampled: values.length,
    };
  }, [holders, baseRaw]);

  if (
    isLoading ||
    totalSupplyRaw === null ||
    baseRaw === null ||
    !holders.length
  )
    return null;

  const supplyDisplay =
    coinType === "VESTS" ? totalSupplyRaw / 1e6 : totalSupplyRaw / 1000;

  const items: {
    key: string;
    label: string;
    value: string;
    sub: React.ReactNode;
    icon: React.ReactNode;
    iconClass: string;
    info?: string;
    hero?: boolean;
  }[] = [
    {
      key: "supply",
      label: t("topHolders.totalSupply"),
      value: formatCompact(supplyDisplay, locale),
      sub: coinType,
      icon: <Database className="h-4 w-4" />,
      iconClass: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
      hero: true,
      info: t("topHolders.shareOfSupplyInfo"),
    },
    {
      key: "largest",
      label: t("topHolders.kpiLargest"),
      value: formatSharePct(stats.largestPct, locale),
      sub: stats.largestAccount ? (
        <Link
          href={`/@${stats.largestAccount}`}
          className="text-link hover:underline"
        >
          @{stats.largestAccount}
        </Link>
      ) : null,
      icon: <Crown className="h-4 w-4" />,
      iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      key: "top10",
      label: t("topHolders.kpiTop10"),
      value: formatSharePct(stats.top10Pct, locale),
      sub: t("topHolders.kpiOfSupply"),
      icon: <Trophy className="h-4 w-4" />,
      iconClass: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    },
    {
      key: "top100",
      label: t("topHolders.kpiTop100"),
      value: formatSharePct(stats.top100Pct, locale),
      sub: t("topHolders.kpiOfSupply"),
      icon: <Users className="h-4 w-4" />,
      iconClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    },
    {
      key: "nakamoto",
      label: t("topHolders.kpiNakamoto"),
      value:
        stats.nakamoto !== null
          ? t("topHolders.kpiAccounts", {
              count: stats.nakamoto.toLocaleString(locale),
            })
          : t("topHolders.kpiNakamotoOver", {
              count: stats.sampled.toLocaleString(locale),
            }),
      sub:
        coinType === "VESTS"
          ? t("topHolders.kpiToControl")
          : t("topHolders.kpiToHold"),
      icon: <Network className="h-4 w-4" />,
      iconClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      info: t("topHolders.kpiNakamotoInfo"),
    },
  ];

  return (
    <div
      className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-5"
      data-testid="top-holders-concentration-strip"
    >
      {items.map((it) => (
        <div
          key={it.key}
          className={cn(
            "rounded-xl border p-3.5 shadow-sm transition-shadow hover:shadow-md",
            it.hero
              ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-800/60 dark:bg-indigo-950/30"
              : "border-gray-200 bg-theme dark:border-gray-700"
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                it.iconClass
              )}
            >
              {it.icon}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {it.label}
              {it.info && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help text-gray-400 hover:text-gray-500">
                        <Info size={11} />
                      </span>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent
                        side="top"
                        className="max-w-[240px] text-center text-[11px]"
                      >
                        {it.info}
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              )}
            </span>
          </div>
          <p className="mt-2.5 text-xl font-bold tracking-tight tabular-nums text-gray-900 dark:text-gray-50">
            {it.value}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
            {it.sub}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TopHoldersConcentrationStrip;
