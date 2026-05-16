import { useMemo, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  CheckCircle,
  Clock,
  XCircle,
  X,
  MoveRight,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Landmark,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useAuth } from "@/contexts/AuthContext";
import useWatchedProposals from "@/hooks/api/proposals/useWatchedProposals";
import { FundingProgressBar, TimeProgressBar } from "@/components/proposals/ProposalCard";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { formatDateToLocale } from "@/utils/TimeUtils";
import fetchingService from "@/services/FetchingService";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { convertVestsToHP } from "@/utils/Calculations";

const STATUS_CONFIG = {
  active: {
    icon: CheckCircle,
    badgeClass: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/20",
    labelKey: "proposalCard.statusActive",
  },
  expired: {
    icon: XCircle,
    badgeClass: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20",
    labelKey: "proposalCard.statusExpired",
  },
  inactive: {
    icon: Clock,
    badgeClass: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
    labelKey: "proposalCard.statusInactive",
  },
} as const;

const WatchedProposalsWidget = () => {
  const { t, locale } = useI18n();
  const { username } = useAuth();
  const { getWatched, toggleWatch, markProposalChanged, clearProposalChange, changedProposalIds } = useWatchlist();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();

  const watchedSet = getWatched("proposals");
  const ids = useMemo(() => Array.from(watchedSet) as number[], [watchedSet]);

  const { watchedProposals, isLoading } = useWatchedProposals(ids);

  const { data: returnProposal } = useQuery({
    queryKey: ["return_proposal_threshold"],
    queryFn: async () => {
      const raw = await fetchingService.getProposal([0]);
      return raw[0] ?? null;
    },
    enabled: ids.length > 0,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const fundingThreshold = returnProposal
    ? parseFloat((returnProposal as any).total_votes)
    : 0;

  const thresholdInHp = useMemo(() => {
    if (!fundingThreshold || !dynamicGlobalData || !hiveChain) return null;
    return convertVestsToHP(
      hiveChain,
      fundingThreshold.toString(),
      dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
      dynamicGlobalData.headBlockDetails.rawTotalVestingShares
    );
  }, [fundingThreshold, dynamicGlobalData, hiveChain]);

  const enriched = useMemo(() => {
    const now = new Date();
    return watchedProposals
      .map((p) => {
        const status: keyof typeof STATUS_CONFIG =
          now < p.start_date ? "inactive" : now > p.end_date ? "expired" : "active";
        const isFunded =
          fundingThreshold > 0 && parseFloat(p.total_votes) > fundingThreshold;
        const daysUntilExpiry = Math.ceil(
          (p.end_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isExpiringSoon =
          status !== "expired" && daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
        return { ...p, status, isFunded, daysUntilExpiry, isExpiringSoon };
      })
      .sort((a, b) => parseFloat(b.total_votes) - parseFloat(a.total_votes));
  }, [watchedProposals, fundingThreshold]);

  // --- Status watcher: persist status daily, notify on ANY change ---
  useEffect(() => {
    if (typeof window === "undefined" || !enriched.length || !username) return;

    const STORAGE_KEY = `hivescan_watched_status_${username}`;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    let stored: Record<string, { funded: boolean; status: string; checkedAt: number }> = {};
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      stored = {};
    }

    const VALID_STATUSES = new Set(["active", "inactive", "expired"]);
    const now = Date.now();
    const changed: Array<{ id: number; subject: string; reason: string }> = [];
    const updated: typeof stored = {};

    for (const p of enriched) {
      if (p.proposal_id === 0) continue;
      const key = String(p.proposal_id);
      const prev = stored[key];

      if (!prev) {
        // First time seen — store silently, no notification
        updated[key] = { funded: p.isFunded, status: p.status, checkedAt: now };
        continue;
      }

      // Discard tampered or unrecognised persisted entries
      if (!VALID_STATUSES.has(prev.status) || typeof prev.funded !== "boolean") {
        updated[key] = { funded: p.isFunded, status: p.status, checkedAt: now };
        continue;
      }

      // Carry forward if within the same day
      if (now - prev.checkedAt < ONE_DAY_MS) {
        updated[key] = prev;
        continue;
      }

      // New day — detect any status change
      const fundedChanged = prev.funded !== p.isFunded;
      const statusChanged = prev.status !== p.status;
      if (fundedChanged || statusChanged) {
        const reason = fundedChanged
          ? p.isFunded
            ? t("smartReminders.becameFunded")
            : t("smartReminders.unfundedTitle")
          : `${prev.status} → ${p.status}`;
        changed.push({ id: p.proposal_id, subject: p.subject, reason });
        markProposalChanged(p.proposal_id);
      }
      updated[key] = { funded: p.isFunded, status: p.status, checkedAt: now };
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (changed.length === 0) return;

    // In-app toast (sonner)
    changed.forEach(({ id, subject, reason }) => {
      toast.warning(reason, {
        description: `#${id} · ${subject}`,
        duration: 8000,
      });
    });

    // Browser notification — best-effort
    if (typeof Notification !== "undefined" && Notification.permission !== "denied") {
      const fire = () => {
        changed.forEach(({ id, subject, reason }) => {
          new Notification(reason, { body: `#${id} · ${subject}` });
        });
      };
      if (Notification.permission === "granted") {
        fire();
      } else {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") fire();
        });
      }
    }
  }, [enriched, t, markProposalChanged, username]);

  return (
    <Card className="col-span-12 lg:col-span-3">
      <CardHeader className="flex justify-between items-center border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <CardTitle>{t("watchlist.proposals.title")}</CardTitle>
        </div>
        <Link
          href="/proposals"
          className="text-sm flex items-center space-x-1 text-muted-foreground hover:text-primary"
        >
          <span>{t("common.seeMore")}</span>
          <MoveRight width={18} />
        </Link>
      </CardHeader>

      <CardContent className="px-2 py-2">
        {ids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <Star className="h-8 w-8 opacity-20" />
            <p className="text-sm text-muted-foreground">
              {t("watchlist.proposals.empty")}
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-1.5 py-1">
            {ids.map((id) => (
              <div
                key={id}
                className="h-20 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-1.5 py-1">
            {enriched.map((p) => {
              const sc = STATUS_CONFIG[p.status];
              const StatusIcon = sc.icon;
              const isReturnProposal = p.proposal_id === 0;

              if (isReturnProposal) {
                return (
                  <li
                    key={p.proposal_id}
                    className="rounded-md border border-amber-400/70 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-600/40 px-2 py-1.5"
                  >
                    {/* Header: funding threshold label + value + remove */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-0.5 text-xs px-1 py-0.5 rounded-full font-medium text-amber-700 bg-amber-200 dark:text-amber-300 dark:bg-amber-900/50">
                        <Landmark className="h-2.5 w-2.5" />
                        {t("returnProposalCard.fundingThresholdLabel")}:&nbsp;
                        {thresholdInHp ? (
                          <span className="font-bold">{thresholdInHp}</span>
                        ) : (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        )}
                      </span>
                      <button
                        onClick={() => toggleWatch("proposals", p.proposal_id)}
                        title={t("watchlist.removeFromWatchlist")}
                        aria-label={t("watchlist.removeFromWatchlist")}
                        className="p-0.5 rounded text-slate-400 hover:text-red-500 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Title */}
                    <Link
                      href="/proposals?ID=0"
                      className="text-xs font-semibold text-link hover:underline line-clamp-1 leading-snug"
                    >
                      {p.subject}
                    </Link>

                    {/* Creator + status */}
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <Image
                        src={getHiveAvatarUrl(p.creator)}
                        alt={p.creator}
                        width={14}
                        height={14}
                        className="rounded-full flex-shrink-0"
                      />
                      <Link
                        href={`/@${p.creator}`}
                        className="text-xs text-link hover:underline truncate max-w-[90px]"
                      >
                        @{p.creator}
                      </Link>
                      <span
                        className={cn(
                          "ml-auto flex items-center gap-0.5 text-xs px-1 py-0.5 rounded-full font-medium",
                          sc.badgeClass
                        )}
                      >
                        <StatusIcon className="h-2.5 w-2.5" />
                        {t(sc.labelKey)}
                      </span>
                    </div>

                    {/* End date */}
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
                      <span>{formatDateToLocale(p.end_date, locale)}</span>
                    </div>
                  </li>
                );
              }

              const expiryLabel =
                p.isExpiringSoon
                  ? p.daysUntilExpiry === 0
                    ? t("smartReminders.endsToday")
                    : t("smartReminders.endsInDays", { days: String(p.daysUntilExpiry) })
                  : null;

              const hasChange = changedProposalIds.has(p.proposal_id);

              return (
                <li
                  key={p.proposal_id}
                  className={cn(
                    "rounded-md border px-2 py-1.5 transition-colors",
                    p.isExpiringSoon && p.daysUntilExpiry <= 2
                      ? "border-red-400 bg-red-50/40 dark:border-red-700 dark:bg-red-950/20"
                      : "bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
                  )}
                >
                  {/* Title row + remove button */}
                  <div className="flex items-start gap-1">
                    <Link
                      href={`/proposals?ID=${p.proposal_id}`}
                      onClick={() => clearProposalChange(p.proposal_id)}
                      className="text-xs font-semibold text-link hover:underline line-clamp-1 flex-1 leading-snug"
                    >
                      #{p.proposal_id} · {p.subject}
                    </Link>
                    {hasChange && (
                      <span
                        title={t("smartReminders.needsAttention")}
                        className="flex-shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-md bg-orange-100 dark:bg-orange-900/40"
                      >
                        <AlertTriangle className="h-3 w-3 text-orange-500 dark:text-orange-400" />
                      </span>
                    )}
                    <button
                      onClick={() => { toggleWatch("proposals", p.proposal_id); clearProposalChange(p.proposal_id); }}
                      title={t("watchlist.removeFromWatchlist")}
                      aria-label={t("watchlist.removeFromWatchlist")}
                      className="flex-shrink-0 p-0.5 rounded text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Creator + badges row */}
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <Image
                      src={getHiveAvatarUrl(p.creator)}
                      alt={p.creator}
                      width={14}
                      height={14}
                      className="rounded-full flex-shrink-0"
                    />
                    <Link
                      href={`/@${p.creator}`}
                      className="text-xs text-link hover:underline truncate max-w-[90px]"
                    >
                      @{p.creator}
                    </Link>
                    <span
                      className={cn(
                        "ml-auto flex items-center gap-0.5 text-xs px-1 py-0.5 rounded-full font-medium",
                        sc.badgeClass
                      )}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {t(sc.labelKey)}
                    </span>
                    {p.isFunded ? (
                      <span className="flex items-center gap-0.5 text-xs px-1 py-0.5 rounded-full font-medium text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/20">
                        <CheckCircle className="h-2.5 w-2.5" />
                        {t("proposalCard.funded")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs px-1 py-0.5 rounded-full font-medium text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20">
                        <AlertCircle className="h-2.5 w-2.5" />
                        {t("proposalCard.unfunded")}
                      </span>
                    )}
                    {expiryLabel && (
                      <span
                        className={cn(
                          "flex items-center gap-0.5 text-xs px-1 py-0.5 rounded-full font-medium",
                          p.daysUntilExpiry <= 2
                            ? "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
                            : "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20"
                        )}
                      >
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {expiryLabel}
                      </span>
                    )}
                  </div>

                  {/* End date */}
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
                    <span>{formatDateToLocale(p.end_date, locale)}</span>
                  </div>

                  {/* Progress bars */}
                  <div className="mt-1 space-y-1">
                    {!p.isFunded &&
                      fundingThreshold > 0 &&
                      p.status === "active" && (
                        <FundingProgressBar
                          currentVotes={parseFloat(p.total_votes)}
                          threshold={fundingThreshold}
                          t={t}
                        />
                      )}
                    <TimeProgressBar
                      startDate={p.start_date}
                      endDate={p.end_date}
                      isUpcoming={p.status === "inactive"}
                      t={t}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

    </Card>
  );
};

export default WatchedProposalsWidget;
