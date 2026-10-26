import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ShieldOff,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Handshake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { useAuth } from "@/contexts/AuthContext";
import useWatchedWitnesses from "@/hooks/api/common/useWatchedWitnesses";
import useWitnessVoteChain from "@/hooks/api/common/useWitnessVoteChain";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { formatAndDelocalizeFromTime } from "@/utils/TimeUtils";
import HiveAvatar from "@/components/ui/HiveAvatar";
import useRecentMissedBlocks from "@/hooks/api/common/useRecentMissedBlocks";
import { formatLocalePercent } from "@/utils/chartUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SortKey = "name" | "rank" | "missed" | "feedAge";
type SortDir = "asc" | "desc";

const FEED_STALE_MS = 24 * 60 * 60 * 1000;

function isFeedStale(date: Date | null): boolean {
  if (!date) return false;
  return Date.now() - date.getTime() > FEED_STALE_MS;
}

interface ColHeader {
  key: SortKey;
  labelKey: string;
  className?: string;
}

const COL_HEADERS: ColHeader[] = [
  { key: "rank", labelKey: "common.rank", className: "w-9 text-center" },
  {
    key: "missed",
    labelKey: "witnesses.missedblocks",
    className: "w-14 text-right",
  },
  {
    key: "feedAge",
    labelKey: "witnesses.feedage",
    className: "w-20 text-right",
  },
];

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (col !== sortKey)
    return <ChevronsUpDown className="inline h-2.5 w-2.5 ml-0.5 opacity-40" />;
  return sortDir === "asc" ? (
    <ChevronUp className="inline h-2.5 w-2.5 ml-0.5 text-primary" />
  ) : (
    <ChevronDown className="inline h-2.5 w-2.5 ml-0.5 text-primary" />
  );
}

const WitnessHealthWidget = () => {
  const { t, dir, locale } = useI18n();
  const { username, isLoggedIn } = useAuth();

  const storageKey = username ? `witnessHealthSort_${username}` : null;

  const [sortKey, setSortKey] = useState<SortKey>(() => {
    if (typeof window === "undefined" || !storageKey) return "rank";
    try {
      return (
        (JSON.parse(localStorage.getItem(storageKey) || "{}").key as SortKey) ||
        "rank"
      );
    } catch {
      return "rank";
    }
  });

  const [sortDir, setSortDir] = useState<SortDir>(() => {
    if (typeof window === "undefined" || !storageKey) return "asc";
    try {
      return (
        (JSON.parse(localStorage.getItem(storageKey) || "{}").dir as SortDir) ||
        "asc"
      );
    } catch {
      return "asc";
    }
  });

  useEffect(() => {
    if (storageKey)
      localStorage.setItem(
        storageKey,
        JSON.stringify({ key: sortKey, dir: sortDir })
      );
  }, [sortKey, sortDir, storageKey]);

  const handleSort = (col: SortKey) => {
    if (col === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      // missed/feedAge default to desc so worst-first; rank to asc.
      setSortDir(col === "missed" || col === "feedAge" ? "desc" : "asc");
    }
  };

  const {
    witnessVotes,
    proxyChain,
    isLoading: isVotesLoading,
  } = useWitnessVoteChain(isLoggedIn ? username || "" : "");
  const { witnesses, isLoading: isHealthLoading } =
    useWatchedWitnesses(witnessVotes);
  // Health is about recent misses; lifetime stays as the fallback and in the tooltip.
  const recentMissed = useRecentMissedBlocks();
  const showRecent = recentMissed.isAvailable && !recentMissed.isWeekUnknown;
  const { getRecentMissed } = recentMissed;
  const missedOf = useCallback(
    (name: string, lifetime: number) =>
      showRecent ? (getRecentMissed(name).week?.missed_count ?? 0) : lifetime,
    [showRecent, getRecentMissed]
  );

  const hasProxy = proxyChain.length > 0;

  const activeCount = witnesses.filter(
    (w) => !w.isLoading && w.isActive
  ).length;
  const inactiveCount = witnesses.filter(
    (w) => !w.isLoading && !w.isActive
  ).length;

  const sorted = useMemo(() => {
    const list = [...witnesses];
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "missed":
          return (
            (missedOf(a.name, a.missedBlocks) -
              missedOf(b.name, b.missedBlocks)) *
              dir || a.rank - b.rank
          );
        case "feedAge": {
          const aT = a.feedUpdatedAt?.getTime() ?? 0;
          const bT = b.feedUpdatedAt?.getTime() ?? 0;
          return (aT - bT) * dir;
        }
        default:
          return (a.rank - b.rank) * dir;
      }
    });
    return list;
  }, [witnesses, sortKey, sortDir, missedOf]);

  return (
    <Card className="col-span-12 lg:col-span-3 overflow-hidden mb-2">
      <CardHeaderWithLink
        title={t("watchlist.witnesses.title")}
        href={`/witnesses?voter=${username}`}
      />

      <CardContent className="px-2 pt-2 pb-1">
        {isVotesLoading ? (
          <div className="space-y-1.5">
            <div className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : witnessVotes.length === 0 && !hasProxy ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <ShieldOff className="h-7 w-7 opacity-20" />
            <p className="text-xs text-muted-foreground">
              {t("watchlist.witnesses.empty")}
            </p>
            <Link
              href="/witnesses"
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("witnesses.title")} →
            </Link>
          </div>
        ) : (
          <>
            {hasProxy && username && (
              <div className="flex items-start gap-1.5 px-2 py-1 mb-1.5 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300">
                <Handshake className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <Link
                    href={`/@${username}`}
                    className="font-semibold hover:underline"
                  >
                    @{username}
                  </Link>
                  <span> {t("accountWitnessVotesCard.uses")} </span>
                  {proxyChain.map((p, i) => (
                    <span key={p}>
                      <Link
                        href={`/@${p}`}
                        className="font-semibold hover:underline"
                      >
                        @{p}
                      </Link>
                      {i < proxyChain.length - 1 && (
                        <span>, {t("accountWitnessVotesCard.whoUses")} </span>
                      )}
                    </span>
                  ))}
                  <span> {t("accountWitnessVotesCard.asVotingProxy")}</span>
                </span>
              </div>
            )}

            {witnessVotes.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 mb-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                <span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {witnessVotes.length.toLocaleString(locale)}/
                    {(30).toLocaleString(locale)}
                  </span>{" "}
                  {t("watchlist.witnesses.votesUsed")}
                </span>
                {!isHealthLoading && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">
                      ·
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {activeCount.toLocaleString(locale)}{" "}
                      {t("watchlist.witnesses.active")}
                    </span>
                    {inactiveCount > 0 && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">
                          ·
                        </span>
                        <span className="text-red-500 dark:text-red-400">
                          {inactiveCount.toLocaleString(locale)}{" "}
                          {t("watchlist.witnesses.inactive")}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {hasProxy && witnessVotes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                {t("watchlist.witnesses.proxyNoVotes")}
              </p>
            ) : isHealthLoading ? (
              <div className="space-y-1">
                {Array.from({
                  length: Math.min(witnessVotes.length || 3, 5),
                }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 px-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleSort("name")}
                    className={cn(
                      "flex-1 min-w-0 text-left text-[0.55rem] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 hover:text-primary transition-colors whitespace-nowrap",
                      sortKey === "name" && "text-primary dark:text-primary"
                    )}
                  >
                    {t("common.name")}
                    <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                  {COL_HEADERS.map((col) => (
                    <button
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={cn(
                        "text-[0.55rem] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 hover:text-primary transition-colors whitespace-nowrap",
                        col.className,
                        sortKey === col.key && "text-primary dark:text-primary"
                      )}
                    >
                      {t(
                        col.key === "missed" && showRecent
                          ? "witnesses.missed7d"
                          : col.labelKey
                      )}
                      <SortIcon
                        col={col.key}
                        sortKey={sortKey}
                        sortDir={sortDir}
                      />
                    </button>
                  ))}
                </div>

                <TooltipProvider>
                  <ul className="space-y-0.5 max-h-72 overflow-y-auto pt-0.5 pr-0.5">
                    {sorted.map((w) => {
                      const stale = isFeedStale(w.feedUpdatedAt);
                      return (
                        <li
                          key={w.name}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded border",
                            w.isActive
                              ? "bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800"
                              : "bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/30"
                          )}
                        >
                          <HiveAvatar
                            accountName={w.name}
                            size={18}
                            alt={w.name}
                            className="rounded-full flex-shrink-0"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                                  w.isLoading
                                    ? "bg-slate-300 animate-pulse"
                                    : w.isActive
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                )}
                              />
                            </TooltipTrigger>
                            {!w.isLoading && (
                              <TooltipPortal>
                                <TooltipContent className="bg-theme text-text text-xs">
                                  {w.isActive
                                    ? t("watchlist.witnesses.active")
                                    : t("watchlist.witnesses.inactive")}
                                </TooltipContent>
                              </TooltipPortal>
                            )}
                          </Tooltip>
                          <Link
                            href={`/@${w.name}`}
                            className="flex-1 min-w-0 text-xs font-medium text-link hover:underline break-all"
                          >
                            @{w.name}
                          </Link>

                          <span className="w-9 text-center flex-shrink-0 text-[0.6rem] font-semibold text-slate-500 dark:text-slate-400">
                            {w.rank > 0
                              ? `#${w.rank.toLocaleString(locale)}`
                              : "—"}
                          </span>

                          {(() => {
                            const recent = getRecentMissed(w.name);
                            const missed = missedOf(w.name, w.missedBlocks);
                            const value = (
                              <span
                                className={cn(
                                  "w-14 text-right flex-shrink-0 text-[0.6rem] font-medium",
                                  showRecent
                                    ? missed > 0
                                      ? "text-red-500 dark:text-red-400"
                                      : "text-slate-300 dark:text-slate-600"
                                    : missed > 500
                                      ? "text-red-500 dark:text-red-400"
                                      : missed > 0
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-slate-300 dark:text-slate-600"
                                )}
                              >
                                {missed > 0
                                  ? missed.toLocaleString(locale)
                                  : "—"}
                              </span>
                            );
                            if (!showRecent) return value;
                            return (
                              <Tooltip>
                                <TooltipTrigger asChild>{value}</TooltipTrigger>
                                <TooltipPortal>
                                  <TooltipContent className="bg-theme text-text text-xs">
                                    {t("witnesses.missedSummary", {
                                      day: recentMissed.isDayUnknown
                                        ? "--"
                                        : (
                                            recent.day?.missed_count ?? 0
                                          ).toLocaleString(locale),
                                      week: (
                                        recent.week?.missed_count ?? 0
                                      ).toLocaleString(locale),
                                      lifetime:
                                        w.missedBlocks.toLocaleString(locale),
                                    })}
                                    {recent.week &&
                                      recent.week.missed_count > 0 && (
                                        <div className="mt-0.5 opacity-80">
                                          {t("witnesses.missedRateTooltip", {
                                            rate: formatLocalePercent(
                                              recent.week.rate * 100,
                                              locale,
                                              2
                                            ),
                                            missed:
                                              recent.week.missed_count.toLocaleString(
                                                locale
                                              ),
                                            scheduled: (
                                              recent.week.missed_count +
                                              recent.week.produced_count
                                            ).toLocaleString(locale),
                                          })}
                                        </div>
                                      )}
                                  </TooltipContent>
                                </TooltipPortal>
                              </Tooltip>
                            );
                          })()}

                          <span
                            className={cn(
                              "w-20 text-right flex-shrink-0 text-[0.6rem] font-medium truncate",
                              stale && w.isActive
                                ? "text-orange-500 dark:text-orange-400"
                                : "text-slate-300 dark:text-slate-600"
                            )}
                          >
                            {w.feedUpdatedAt
                              ? formatAndDelocalizeFromTime(
                                  w.feedUpdatedAt,
                                  locale
                                )
                              : "—"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </TooltipProvider>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WitnessHealthWidget;
