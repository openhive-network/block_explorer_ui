import React from "react";
import Link from "next/link";
import { Loader2, X, Info } from "lucide-react";
import moment from "moment";
import { useI18n } from "@/i18n/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatRc } from "@/components/account/tabs/rcFootprint/rcFootprintUtils";
import useAccountRcFootprintTimeline from "@/hooks/api/accountPage/useAccountRcFootprintTimeline";
import { RcGroupBy } from "@/hooks/api/accountPage/useAccountRcFootprint";

interface RcConsumptionDrilldownProps {
  accountName: string;
  groupBy: RcGroupBy;
  // Raw bucket key (op_type name or resolved DApp) — the timeline filter value.
  bucketKey: string;
  // Display label for the header.
  label: string;
  // Bucket color, reused for the timeline rail nodes.
  color: string;
  fromDate?: string | Date | number;
  toDate?: string | Date | number;
  onClose: () => void;
}

const TIMELINE_CSS = `
.rc-tl { position: relative; }
.rc-tl::before {
  content: ""; position: absolute; inset-inline-start: 6px; top: 6px; bottom: 6px;
  width: 2px; border-radius: 2px; background-color: rgba(148, 163, 184, 0.30);
}
.rc-tl-item { position: relative; padding-inline-start: 26px; padding-bottom: 14px; }
.rc-tl-item:last-child { padding-bottom: 2px; }
.rc-tl-dot {
  position: absolute; inset-inline-start: 1.5px; top: 4px; width: 11px; height: 11px;
  border-radius: 9999px;
}
.rc-tl-day { position: relative; padding-inline-start: 26px; padding-top: 2px; padding-bottom: 8px; }
.rc-tl-day-dot {
  position: absolute; inset-inline-start: 0.5px; top: 3px; width: 13px; height: 13px;
  border-radius: 9999px; border: 2px solid rgba(148, 163, 184, 0.7);
  background-color: transparent;
}
.rc-tl-rc {
  display: inline-block; padding: 1px 6px; border-radius: 9999px;
  font-size: 11px; font-variant-numeric: tabular-nums; white-space: nowrap;
}
@keyframes rc-tl-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.rc-tl-in { animation: rc-tl-in 0.3s ease both; }
@media (prefers-reduced-motion: reduce) { .rc-tl-in { animation: none; } }
`;

const RcConsumptionDrilldown: React.FC<RcConsumptionDrilldownProps> = ({
  accountName,
  groupBy,
  bucketKey,
  label,
  color,
  fromDate,
  toDate,
  onClose,
}) => {
  const { t, locale } = useI18n();

  const {
    rows,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAccountRcFootprintTimeline(
    accountName,
    groupBy === "op_type"
      ? { opTypeFilter: bucketKey }
      : { appFilter: bucketKey },
    fromDate,
    toDate
  );

  // Op-type grouping → show the DApp; DApp grouping → show the custom_json id.
  const byOpType = groupBy === "op_type";
  const detailOf = (r: (typeof rows)[number]) =>
    byOpType ? (r.app ?? r.custom_json_id ?? "—") : (r.custom_json_id ?? "—");

  // Build timeline nodes with a day divider whenever the UTC date changes.
  const nodes: React.ReactNode[] = [];
  let lastDay = "";
  rows.forEach((r, i) => {
    const m = moment.utc(r.timestamp);
    const day = m.format("YYYY-MM-DD");
    if (day !== lastDay) {
      lastDay = day;
      nodes.push(
        <li
          key={`day-${day}`}
          className="rc-tl-day rc-tl-in"
          style={{ animationDelay: `${Math.min(i, 15) * 25}ms` }}
        >
          <span className="rc-tl-day-dot" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {m.locale(locale).format("ll")}
          </span>
        </li>
      );
    }
    const detail = detailOf(r);
    nodes.push(
      <li
        key={r.op_seq}
        className="rc-tl-item rc-tl-in"
        style={{ animationDelay: `${Math.min(i, 15) * 25}ms` }}
      >
        <span className="rc-tl-dot" style={{ backgroundColor: color }} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-medium tabular-nums text-explorer-dark-gray dark:text-text">
            {m.format("HH:mm:ss")}
            <span className="ms-1 text-[10px] font-normal uppercase text-gray-400">
              UTC
            </span>
          </span>
          <span
            className="rc-tl-rc"
            style={{ color, backgroundColor: `${color}1a` }}
          >
            {formatRc(r.rc_consumed, locale)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
          {detail !== "—" && (
            <>
              <span className="min-w-0 truncate" title={detail}>
                {detail}
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
            </>
          )}
          <Link
            href={`/block/${r.block_num}`}
            className="shrink-0 tabular-nums text-link hover:underline"
          >
            #{r.block_num.toLocaleString(locale)}
          </Link>
        </div>
      </li>
    );
  });

  return (
    <div className="mt-2 rounded-md border border-gray-200 bg-theme dark:border-gray-700">
      <style>{TIMELINE_CSS}</style>
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <h4 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
          <span className="truncate">
            {t("rcConsumption.eventsFor", { label })}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="shrink-0 cursor-help text-gray-400 hover:text-gray-500">
                  <Info size={12} />
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  side="top"
                  className="max-w-[240px] text-center text-[11px] normal-case"
                >
                  {t("rcFootprint.timelineEstimateNote")}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        </h4>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("rcFootprint.close")}
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[320px] overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : isError ? (
          <p className="py-4 text-sm text-red-500">
            {t("common.errorLoadingData")}
          </p>
        ) : rows.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">
            {t("common.noDataAvailable")}
          </p>
        ) : (
          <>
            <ol className="rc-tl">{nodes}</ol>
            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {isFetchingNextPage && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  {t("rcFootprint.loadMore")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RcConsumptionDrilldown;
