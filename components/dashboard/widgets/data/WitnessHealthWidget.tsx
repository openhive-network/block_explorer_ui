import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoveRight, ShieldOff, ChevronUp, ChevronDown, ChevronsUpDown, MoveLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import useWatchedWitnesses from "@/hooks/api/common/useWatchedWitnesses";
import useWitnessVoteChain from "@/hooks/api/common/useWitnessVoteChain";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

type SortKey = "rank" | "missed" | "status" | "feedAge";
type SortDir = "asc" | "desc";

const FEED_STALE_MS = 24 * 60 * 60 * 1000;

function isFeedStale(date: Date | null): boolean {
  if (!date) return false;
  return Date.now() - date.getTime() > FEED_STALE_MS;
}

function feedAgeLabel(date: Date | null): string {
  if (!date) return "";
  const h = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface ColHeader {
  key: SortKey;
  labelKey: string;
  className?: string;
}

const COL_HEADERS: ColHeader[] = [
  { key: "status",  labelKey: "common.status",         className: "w-10 text-center" },
  { key: "rank",    labelKey: "common.rank",            className: "w-10 text-center" },
  { key: "missed",  labelKey: "witnesses.missedblocks", className: "flex-1 text-right" },
  { key: "feedAge", labelKey: "witnesses.feedage",      className: "w-14 text-right"  },
];

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="inline h-2.5 w-2.5 ml-0.5 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp   className="inline h-2.5 w-2.5 ml-0.5 text-primary" />
    : <ChevronDown className="inline h-2.5 w-2.5 ml-0.5 text-primary" />;
}

const WitnessHealthWidget = () => {
  const { t, dir } = useI18n();
  const SeeMoreIcon = dir === "rtl" ? MoveLeft : MoveRight;
  const { username, isLoggedIn } = useAuth();

  const storageKey = username ? `witnessHealthSort_${username}` : null;

  const [sortKey, setSortKey] = useState<SortKey>(() => {
    if (typeof window === "undefined" || !storageKey) return "rank";
    try { return (JSON.parse(localStorage.getItem(storageKey) || "{}").key as SortKey) || "rank"; }
    catch { return "rank"; }
  });

  const [sortDir, setSortDir] = useState<SortDir>(() => {
    if (typeof window === "undefined" || !storageKey) return "asc";
    try { return (JSON.parse(localStorage.getItem(storageKey) || "{}").dir as SortDir) || "asc"; }
    catch { return "asc"; }
  });

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify({ key: sortKey, dir: sortDir }));
  }, [sortKey, sortDir, storageKey]);

  const handleSort = (col: SortKey) => {
    if (col === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      // sensible defaults: rank/status asc (low rank = good), missed/feedAge desc (worst first)
      setSortDir(col === "missed" || col === "feedAge" ? "desc" : "asc");
    }
  };

  const { witnessVotes, isLoading: isVotesLoading } = useWitnessVoteChain(
    isLoggedIn ? (username || "") : ""
  );
  const { witnesses, isLoading: isHealthLoading } = useWatchedWitnesses(witnessVotes);

  const isLoading = isVotesLoading || isHealthLoading;
  const activeCount  = witnesses.filter((w) => !w.isLoading &&  w.isActive).length;
  const inactiveCount = witnesses.filter((w) => !w.isLoading && !w.isActive).length;

  const sorted = useMemo(() => {
    const list = [...witnesses];
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case "status":
          if (a.isActive !== b.isActive) return (a.isActive ? 1 : -1) * dir;
          return (a.rank - b.rank) * dir;
        case "missed":
          return (a.missedBlocks - b.missedBlocks) * dir;
        case "feedAge": {
          const aT = a.feedUpdatedAt?.getTime() ?? 0;
          const bT = b.feedUpdatedAt?.getTime() ?? 0;
          return (aT - bT) * dir;
        }
        default: // rank
          return (a.rank - b.rank) * dir;
      }
    });
    return list;
  }, [witnesses, sortKey, sortDir]);

  return (
    <Card className="col-span-12 lg:col-span-3 overflow-hidden">
      <CardHeader className="flex justify-between items-center border-b px-3 py-2.5">
        <CardTitle>{t("watchlist.witnesses.title")}</CardTitle>
        <Link
          href={`/witnesses?voter=${username}`}
          className="text-sm flex items-center space-x-1"
        >
          <span>{t("common.seeMore")}</span>
          <SeeMoreIcon width={18} />
        </Link>
      </CardHeader>

      <CardContent className="px-2 pt-2 pb-1">
        {/* Vote summary bar */}
        {witnessVotes.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 mb-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
            <span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {witnessVotes.length}/30
              </span>{" "}
              {t("watchlist.witnesses.votesUsed")}
            </span>
            {!isLoading && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-green-600 dark:text-green-400">
                  {activeCount} {t("watchlist.witnesses.active")}
                </span>
                {inactiveCount > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-red-500 dark:text-red-400">
                      {inactiveCount} {t("watchlist.witnesses.offline")}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {witnessVotes.length === 0 && !isVotesLoading ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <ShieldOff className="h-7 w-7 opacity-20" />
            <p className="text-xs text-muted-foreground">{t("watchlist.witnesses.empty")}</p>
            <Link href="/witnesses" className="text-xs font-medium text-primary hover:underline">
              {t("witnesses.title")} →
            </Link>
          </div>
        ) : isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: Math.min(witnessVotes.length || 3, 5) }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="flex items-center gap-1.5 px-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              {/* name col — not sortable, takes remaining space */}
              <span className="flex-1 text-[0.6rem] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {t("common.name")}
              </span>
              {COL_HEADERS.map((col) => (
                <button
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={cn(
                    "text-[0.6rem] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 hover:text-primary transition-colors whitespace-nowrap",
                    col.className,
                    sortKey === col.key && "text-primary dark:text-primary"
                  )}
                >
                  {t(col.labelKey)}
                  <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                </button>
              ))}
            </div>

            {/* List */}
            <ul className="space-y-0.5 max-h-72 overflow-y-auto pt-0.5 pr-0.5">
              {sorted.map((w) => {
                const stale = isFeedStale(w.feedUpdatedAt);
                return (
                  <li
                    key={w.name}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded border",
                      w.isActive
                        ? "bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800"
                        : "bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/30"
                    )}
                  >
                    {/* Avatar + name — flex-1 */}
                    <Image
                      src={getHiveAvatarUrl(w.name)}
                      alt={w.name}
                      width={18}
                      height={18}
                      className="rounded-full flex-shrink-0"
                    />
                    <Link
                      href={`/@${w.name}`}
                      className="flex-1 min-w-0 text-xs font-medium text-link hover:underline truncate"
                    >
                      @{w.name}
                    </Link>

                    {/* Status dot — aligns under Status col */}
                    <span className="w-10 flex justify-center flex-shrink-0">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          w.isLoading ? "bg-slate-300 animate-pulse"
                            : w.isActive ? "bg-green-500" : "bg-red-500"
                        )}
                      />
                    </span>

                    {/* Rank — aligns under Rank col */}
                    <span className="w-10 text-center flex-shrink-0 text-[0.6rem] font-semibold text-slate-500 dark:text-slate-400">
                      {w.rank > 0 ? `#${w.rank}` : "—"}
                    </span>

                    {/* Missed blocks — aligns under Missed col */}
                    <span className={cn(
                      "flex-1 text-right flex-shrink-0 text-[0.6rem] font-medium",
                      w.missedBlocks > 500
                        ? "text-red-500 dark:text-red-400"
                        : w.missedBlocks > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-300 dark:text-slate-600"
                    )}>
                      {w.missedBlocks > 0 ? w.missedBlocks.toLocaleString() : "—"}
                    </span>

                    {/* Feed age — aligns under Feed Age col */}
                    <span className={cn(
                      "w-14 text-right flex-shrink-0 text-[0.6rem] font-medium",
                      stale && w.isActive
                        ? "text-orange-500 dark:text-orange-400"
                        : "text-slate-300 dark:text-slate-600"
                    )}>
                      {w.feedUpdatedAt ? feedAgeLabel(w.feedUpdatedAt) : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WitnessHealthWidget;
