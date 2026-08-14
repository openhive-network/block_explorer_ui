import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import TimeAgo from "timeago-react";
import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { opTypeIdsByName } from "@/utils/OperationTypes";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import { getOperationColor } from "@/components/OperationsTable";
import { getOperationTypeForDisplay } from "@/utils/UI";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useI18n } from "@/i18n/i18n";
import { parseChainDate } from "@/utils/TimeUtils";
import { cn } from "@/lib/utils";

const CATEGORY_FEED_SIZE: Record<string, number> = { all: 50 };
const DEFAULT_FEED_SIZE = 20;

type Category = "all" | "transfers" | "votes" | "rewards" | "witness";

const TRANSFER_OPS = new Set([
  "transfer_operation",
  "transfer_to_savings_operation",
  "transfer_from_savings_operation",
  "cancel_transfer_from_savings_operation",
  "fill_transfer_from_savings_operation",
  "recurrent_transfer_operation",
  "fill_recurrent_transfer_operation",
  "failed_recurrent_transfer_operation",
  "escrow_transfer_operation",
  "transfer_to_vesting_operation",
  "transfer_to_vesting_completed_operation",
]);
const VOTE_OPS = new Set([
  "vote_operation",
  "effective_comment_vote_operation",
  "account_witness_vote_operation",
  "update_proposal_votes_operation",
]);
const REWARD_OPS = new Set([
  "author_reward_operation",
  "comment_benefactor_reward_operation",
  "comment_reward_operation",
  "claim_reward_balance_operation",
  "curation_reward_operation",
  "liquidity_reward_operation",
  "pow_reward_operation",
  "producer_reward_operation",
]);
const WITNESS_OPS = new Set([
  "shutdown_witness_operation",
  "witness_block_approve_operation",
  "witness_set_properties_operation",
  "witness_update_operation",
  "account_witness_proxy_operation",
  "account_witness_vote_operation",
]);

const formatOpName = (raw: string): string => {
  const stripped = getOperationTypeForDisplay(raw);
  return stripped
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const extractDetail = (value: unknown): React.ReactNode => {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (React.isValidElement(value)) return value;
  if (typeof value === "object") {
    const msg = (value as { message?: unknown }).message;
    if (msg != null && (typeof msg === "string" || React.isValidElement(msg)))
      return msg;
  }
  return null;
};

type OpRow = {
  operation_id: string | number;
  block: number;
  op_pos: number;
  trx_id?: string;
  timestamp: string;
  op?: { type?: string; value?: unknown };
};

const FILTER_CHIPS: Array<{ key: Category; labelKey: string }> = [
  { key: "all", labelKey: "widgets.myRecentActivityFilterAll" },
  { key: "transfers", labelKey: "widgets.myRecentActivityFilterTransfers" },
  { key: "votes", labelKey: "widgets.myRecentActivityFilterVotes" },
  { key: "rewards", labelKey: "widgets.myRecentActivityFilterRewards" },
  { key: "witness", labelKey: "widgets.myRecentActivityFilterWitness" },
];

const MyRecentActivityWidget: React.FC = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { username, isLoggedIn } = useAuth();
  const { settings } = useSettings();

  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const FEED_SIZE = CATEGORY_FEED_SIZE[activeCategory] ?? DEFAULT_FEED_SIZE;
  const [opsMap, setOpsMap] = useState<Map<string, OpRow>>(new Map());
  const lastSeenIdsRef = useRef<Set<string>>(new Set());
  const [newOpIds, setNewOpIds] = useState<Set<string>>(new Set());
  const [newOpsCount, setNewOpsCount] = useState(0);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const { operationsTypes } = useOperationsTypes();
  const opTypeIdsByCategory = useMemo(
    () => ({
      all: null as number[] | null,
      transfers: opTypeIdsByName(operationsTypes, TRANSFER_OPS),
      votes: opTypeIdsByName(operationsTypes, VOTE_OPS),
      rewards: opTypeIdsByName(operationsTypes, REWARD_OPS),
      witness: opTypeIdsByName(operationsTypes, WITNESS_OPS),
    }),
    [operationsTypes]
  );

  const operationTypesForFetch = opTypeIdsByCategory[activeCategory];
  const isCatalogReady = !!operationsTypes;

  const fortyEightHoursAgo = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() - 48);
    return d;
  }, []);

  const { accountOperations: latestData, isAccountOperationsLoading } =
    useAccountOperations(
      isLoggedIn && username && isCatalogReady
        ? { accountName: username, operationTypes: operationTypesForFetch }
        : undefined,
      settings.liveData
    );

  const tailCount = latestData?.operations_result?.length ?? 0;
  const totalPages = latestData?.total_pages ?? 0;
  const needsBackfill =
    totalPages > 1 && tailCount > 0 && tailCount < FEED_SIZE;

  const { accountOperations: backfillData } = useAccountOperations(
    isLoggedIn && username && isCatalogReady && needsBackfill
      ? {
          accountName: username,
          operationTypes: operationTypesForFetch,
          pageNumber: totalPages - 1,
        }
      : undefined,
    false
  );

  const { accountOperations: recentCountData } = useAccountOperations(
    isLoggedIn && username && isCatalogReady
      ? {
          accountName: username,
          operationTypes: operationTypesForFetch,
          startDate: fortyEightHoursAgo,
          pageSize: 1,
        }
      : undefined,
    false
  );

  useEffect(() => {
    setOpsMap(new Map());
    setNewOpIds(new Set());
    setNewOpsCount(0);
    setLastFetchedAt(null);
    lastSeenIdsRef.current = new Set();
  }, [username, activeCategory]);

  useEffect(() => {
    const ops = latestData?.operations_result as OpRow[] | undefined;
    if (!ops || ops.length === 0) return;

    const incomingNewIds = new Set<string>();
    if (lastSeenIdsRef.current.size > 0) {
      for (const op of ops) {
        const id = String(op.operation_id);
        if (!lastSeenIdsRef.current.has(id)) incomingNewIds.add(id);
      }
    }
    ops.forEach((op) => lastSeenIdsRef.current.add(String(op.operation_id)));

    setOpsMap((prev) => {
      const next = new Map(prev);
      for (const op of ops) next.set(String(op.operation_id), op);
      return next;
    });

    if (incomingNewIds.size > 0) {
      setNewOpIds((prev) => {
        const next = new Set(prev);
        incomingNewIds.forEach((id) => next.add(id));
        return next;
      });
      setNewOpsCount((prev) => prev + incomingNewIds.size);
    }
    setLastFetchedAt(new Date());
  }, [latestData]);

  useEffect(() => {
    if (newOpsCount === 0) return;
    const id = window.setTimeout(() => setNewOpsCount(0), 6000);
    return () => window.clearTimeout(id);
  }, [newOpsCount]);

  useEffect(() => {
    if (newOpIds.size === 0) return;
    const id = window.setTimeout(() => setNewOpIds(new Set()), 6000);
    return () => window.clearTimeout(id);
  }, [newOpIds]);

  const sortedOps = useMemo(() => {
    const map = new Map(opsMap);
    if (needsBackfill && backfillData?.operations_result) {
      for (const op of backfillData.operations_result as OpRow[]) {
        const id = String(op.operation_id);
        if (!map.has(id)) map.set(id, op);
      }
    }
    return Array.from(map.values())
      .sort((a, b) => {
        if (b.block !== a.block) return b.block - a.block;
        return b.op_pos - a.op_pos;
      })
      .slice(0, FEED_SIZE);
  }, [opsMap, needsBackfill, backfillData, FEED_SIZE]);

  const formattedOps =
    (useOperationsFormatter(sortedOps) as OpRow[] | undefined) ?? sortedOps;

  const filteredOps = formattedOps;

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Activity}
        message={t("widgets.myRecentActivityLoggedOut")}
      />
    );
  }

  const recentCount = recentCountData?.total_operations ?? 0;

  // One provider for the whole feed: a per-tooltip provider would mean dozens
  // of them in a 50-row list.
  return (
    <TooltipProvider>
      <Card className="col-span-12 lg:col-span-3 overflow-hidden mb-2 h-full flex flex-col">
        <CardHeaderWithLink
          className="flex-shrink-0"
          href={`/@${username}`}
          title={
            <span className="flex items-center gap-2 min-w-0">
              <span className="truncate">
                {t("widgets.myRecentActivityName")}
              </span>
              {newOpsCount > 0 && (
                <span
                  className="text-[0.6rem] font-medium px-1.5 py-0.5 rounded-full bg-primary/15 text-primary animate-pulse whitespace-nowrap"
                  aria-live="polite"
                >
                  {t("widgets.myRecentActivityNewOps", {
                    count: String(newOpsCount),
                  })}
                </span>
              )}
            </span>
          }
        />

        <div className="px-2 pt-2 flex-shrink-0">
          <div className="flex gap-1 flex-wrap">
            {FILTER_CHIPS.map(({ key, labelKey }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={cn(
                  "text-[0.6rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full transition-colors",
                  activeCategory === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="px-2 pt-2 pb-2 flex-1 min-h-0 overflow-y-auto">
          {isAccountOperationsLoading && opsMap.size === 0 ? (
            <div className="space-y-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : filteredOps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
              <Activity className="h-7 w-7 opacity-20" />
              <p className="text-xs text-muted-foreground">
                {t("widgets.myRecentActivityEmpty")}
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-0.5">
                {filteredOps.map((op) => {
                  const type = op.op?.type ?? "";
                  const dotClass = getOperationColor(type) || "bg-slate-400";
                  const label = formatOpName(type);
                  const detail = extractDetail(op.op?.value);
                  const created = parseChainDate(op.timestamp);
                  const absoluteDate = created?.toLocaleString(locale) ?? "";
                  const trxShort = op.trx_id ? op.trx_id.slice(0, 8) : null;
                  const params = new URLSearchParams();
                  if (op.trx_id) params.append("trxId", op.trx_id);
                  if (op.operation_id !== undefined)
                    params.append("opId", String(op.operation_id));
                  const href = `/block/${op.block}${
                    params.toString() ? `?${params.toString()}` : ""
                  }`;
                  const isNew = newOpIds.has(String(op.operation_id));
                  const handleRowClick = (
                    e: React.MouseEvent<HTMLLIElement>
                  ) => {
                    if ((e.target as HTMLElement).closest("a")) return;
                    router.push(href);
                  };
                  return (
                    <li
                      key={op.operation_id}
                      onClick={handleRowClick}
                      className={cn(
                        "flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors",
                        isNew
                          ? "bg-amber-50 dark:bg-amber-950/20 ring-1 ring-amber-300/60 dark:ring-amber-700/40 animate-pulse"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <span
                        className={`h-1.5 w-1.5 mt-1.5 rounded-full flex-shrink-0 ${dotClass}`}
                        aria-hidden
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <Link
                            href={href}
                            className="text-xs font-medium text-link hover:underline truncate"
                          >
                            {label}
                          </Link>
                          {trxShort && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={href}
                                  className="font-mono text-[0.55rem] tracking-tight text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-px rounded hover:text-primary transition-colors flex-shrink-0"
                                >
                                  {trxShort}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent className="font-mono text-xs">
                                {op.trx_id}
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* No tooltip: it would only restate the number shown. */}
                          <span className="font-mono text-[0.55rem] tracking-tight text-slate-400 dark:text-slate-500 flex-shrink-0">
                            #{op.block.toLocaleString(locale)}
                          </span>
                        </div>
                        {detail != null && (
                          <div className="text-[0.65rem] text-slate-500 dark:text-slate-400 break-words line-clamp-2">
                            {detail}
                          </div>
                        )}
                      </div>
                      {created && (
                        <Tooltip>
                          {/* A span, not TimeAgo itself: asChild needs a ref the
                            third-party component does not forward. */}
                          <TooltipTrigger asChild>
                            <span className="text-[0.6rem] text-slate-400 dark:text-slate-500 flex-shrink-0 whitespace-nowrap mt-0.5">
                              <TimeAgo locale={locale} datetime={created} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{absoluteDate}</TooltipContent>
                        </Tooltip>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </CardContent>

        {recentCount > 0 && (
          <div className="border-t bg-background px-2 py-1.5 flex-shrink-0 text-[0.6rem] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 flex-wrap">
            <span>
              {t("widgets.myRecentActivityFooter", {
                shown: String(formattedOps.length),
                total: recentCount.toLocaleString(locale),
              })}
            </span>
            {lastFetchedAt && (
              <>
                <span aria-hidden>·</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      {t("widgets.myRecentActivityUpdated")}
                      <TimeAgo locale={locale} datetime={lastFetchedAt} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {lastFetchedAt.toLocaleString(locale)}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default MyRecentActivityWidget;
