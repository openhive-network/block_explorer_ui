import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import TimeAgo from "timeago-react";
import { Activity, MoveRight, MoveLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import { getOperationColor } from "@/components/OperationsTable";
import { getOperationTypeForDisplay } from "@/utils/UI";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

const FEED_SIZE = 50;

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
  const { t, dir, locale } = useI18n();
  const SeeMoreIcon = dir === "rtl" ? MoveLeft : MoveRight;
  const router = useRouter();
  const { username, isLoggedIn } = useAuth();
  const { settings } = useSettings();

  // HAFAH pagination is inverted: page 1 = OLDEST, last page = MOST RECENT.
  // No page number → API returns the latest page; liveData controls refetch.
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [opsMap, setOpsMap] = useState<Map<string, OpRow>>(new Map());
  const lastSeenIdsRef = useRef<Set<string>>(new Set());
  const [newOpIds, setNewOpIds] = useState<Set<string>>(new Set());
  const [newOpsCount, setNewOpsCount] = useState(0);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  // Map op-type names to numeric IDs so we can server-filter by category.
  const { operationsTypes } = useOperationsTypes();
  const opTypeIdsByCategory = useMemo(() => {
    const idsForNames = (names: Set<string>): number[] => {
      const ids: number[] = [];
      operationsTypes?.forEach((t) => {
        if (names.has(t.operation_name)) ids.push(t.op_type_id);
      });
      return ids;
    };
    return {
      all: null as number[] | null,
      transfers: idsForNames(TRANSFER_OPS),
      votes: idsForNames(VOTE_OPS),
      rewards: idsForNames(REWARD_OPS),
      witness: idsForNames(WITNESS_OPS),
    };
  }, [operationsTypes]);

  const operationTypesForFetch = opTypeIdsByCategory[activeCategory];
  const isCatalogReady = !!operationsTypes;

  const { accountOperations: latestData, isAccountOperationsLoading } =
    useAccountOperations(
      isLoggedIn && username && isCatalogReady
        ? { accountName: username, operationTypes: operationTypesForFetch }
        : undefined,
      settings.liveData
    );

  // Reset accumulated state on account OR category change. Category needs its
  // own dataset since the API returns only the matching op types.
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
    return Array.from(opsMap.values())
      .sort((a, b) => {
        if (b.block !== a.block) return b.block - a.block;
        return b.op_pos - a.op_pos;
      })
      .slice(0, FEED_SIZE);
  }, [opsMap]);

  const formattedOps =
    (useOperationsFormatter(sortedOps) as OpRow[] | undefined) ?? sortedOps;

  // Server-side filter handles category narrowing; no client filter needed.
  const filteredOps = formattedOps;

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Activity}
        message={t("widgets.myRecentActivityLoggedOut")}
      />
    );
  }

  const total = latestData?.total_operations ?? 0;

  return (
    <Card className="col-span-12 lg:col-span-3 overflow-hidden mb-2 h-full flex flex-col">
      <CardHeader className="flex justify-between items-center border-b px-3 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <CardTitle>{t("widgets.myRecentActivityName")}</CardTitle>
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
        </div>
        <Link
          href={`/@${username}`}
          className="text-sm flex items-center space-x-1"
        >
          <span>{t("common.seeMore")}</span>
          <SeeMoreIcon width={18} />
        </Link>
      </CardHeader>

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
                const absoluteDate = new Date(
                  op.timestamp + "Z"
                ).toLocaleString(locale);
                const trxShort = op.trx_id ? op.trx_id.slice(0, 8) : null;
                const params = new URLSearchParams();
                if (op.trx_id) params.append("trxId", op.trx_id);
                if (op.operation_id !== undefined)
                  params.append("opId", String(op.operation_id));
                const href = `/block/${op.block}${
                  params.toString() ? `?${params.toString()}` : ""
                }`;
                const isNew = newOpIds.has(String(op.operation_id));
                const handleRowClick = (e: React.MouseEvent<HTMLLIElement>) => {
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
                          <Link
                            href={href}
                            className="font-mono text-[0.55rem] tracking-tight text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-px rounded hover:text-primary transition-colors flex-shrink-0"
                            title={op.trx_id}
                          >
                            {trxShort}
                          </Link>
                        )}
                        <span
                          className="font-mono text-[0.55rem] tracking-tight text-slate-400 dark:text-slate-500 flex-shrink-0"
                          title={`Block ${op.block}`}
                        >
                          #{op.block.toLocaleString()}
                        </span>
                      </div>
                      {detail != null && (
                        <div className="text-[0.65rem] text-slate-500 dark:text-slate-400 break-words line-clamp-2">
                          {detail}
                        </div>
                      )}
                    </div>
                    <TimeAgo
                      className="text-[0.6rem] text-slate-400 dark:text-slate-500 flex-shrink-0 whitespace-nowrap mt-0.5"
                      locale={locale}
                      datetime={op.timestamp + "Z"}
                      title={absoluteDate}
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>

      {total > 0 && (
        <div className="border-t bg-background px-2 py-1.5 flex-shrink-0 text-[0.6rem] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 flex-wrap">
          <span>
            {t("widgets.myRecentActivityFooter", {
              shown: String(formattedOps.length),
              total: total.toLocaleString(),
            })}
          </span>
          {lastFetchedAt && (
            <>
              <span aria-hidden>·</span>
              <span
                className="inline-flex items-center gap-1 whitespace-nowrap"
                title={lastFetchedAt.toLocaleString(locale)}
              >
                {t("widgets.myRecentActivityUpdated")}
                <TimeAgo locale={locale} datetime={lastFetchedAt} />
              </span>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default MyRecentActivityWidget;
