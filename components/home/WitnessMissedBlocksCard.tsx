import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import HiveAvatar from "@/components/ui/HiveAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import useWitnessMissedBlocks from "@/hooks/api/homePage/useWitnessMissedBlocks";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import {
  formatMissRate,
  rangeToWindow,
  summariseMissedBlocks,
  toMissedBlocksRows,
  type MissedBlocksRange,
} from "@/utils/witnessMissedBlocks";
import { useI18n } from "@/i18n/i18n";

const WitnessMissedBlocksFullChartDialog = dynamic(
  () => import("./WitnessMissedBlocksFullChartDialog"),
  { ssr: false }
);

// 19 rows + summary line match the 21-row schedule card's height.
const CARD_ROWS = 19;
// All witnesses, so the summary line counts every miss, not just the rows shown.
const ALL_ROWS = 1000;

// Matches the witness schedule widget so both share one cached request.
const WITNESS_RANK_LIMIT = 100;

const REFRESH_MS = 60_000;

// Minute-rounded so switching ranges within a minute reuses the cached request.
const currentMinute = () =>
  new Date(Math.floor(Date.now() / REFRESH_MS) * REFRESH_MS);

const WitnessMissedBlocksCard: React.FC = () => {
  const { t, locale } = useI18n();
  const [range, setRange] = useState<MissedBlocksRange>("today");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [now, setNow] = useState(currentMinute);
  useEffect(() => {
    // A hidden tab skips the refresh and catches up when it is shown again.
    const tick = () => {
      if (!document.hidden) setNow(currentMinute());
    };
    const id = setInterval(tick, REFRESH_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  const rangeWindow = useMemo(() => rangeToWindow(range, now), [range, now]);

  const { missedBlocksData, isMissedBlocksLoading, isMissedBlocksError } =
    useWitnessMissedBlocks({
      fromDate: rangeWindow.fromDate,
      toDate: rangeWindow.toDate,
      orderBy: "missed",
      limitCount: ALL_ROWS,
    });

  const { witnessesData } = useWitnesses(WITNESS_RANK_LIMIT, "rank", "asc");

  const rows = useMemo(
    () => toMissedBlocksRows(missedBlocksData, witnessesData?.witnesses),
    [missedBlocksData, witnessesData]
  );
  const totals = useMemo(() => summariseMissedBlocks(rows), [rows]);

  const rangeOptions = [
    { value: "today" as const, label: t("witnessMissedBlocksCard.today") },
    { value: "7d" as const, label: t("witnessMissedBlocksCard.last7d") },
    { value: "30d" as const, label: t("witnessMissedBlocksCard.last30d") },
  ];

  return (
    <Card
      className="col-span-12 md:col-span-11 lg:col-span-3 overflow-hidden flex flex-col mb-2"
      data-testid="witness-missed-blocks-card"
    >
      <CardHeaderWithLink
        title={t("witnessMissedBlocksCard.title")}
        onSeeMore={() => setIsModalOpen(true)}
        linkTestId="witness-missed-blocks-see-more-btn"
        actions={
          <SegmentedToggle<MissedBlocksRange>
            ariaLabel={t("witnessMissedBlocksCard.rangeLabel")}
            value={range}
            onChange={setRange}
            options={rangeOptions}
          />
        }
      />

      <CardContent className="px-2 py-3 flex-grow">
        {isMissedBlocksLoading ? (
          <div className="flex items-center justify-center min-h-[220px]">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : isMissedBlocksError ? (
          <p className="text-red-500 text-sm text-center py-8">
            {t("common.errorLoadingData")}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            {t("witnessMissedBlocksCard.noMisses")}
          </p>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 px-1 pb-2 mb-1 border-b">
              <p className="min-w-0 text-[11px] text-gray-500">
                {t("witnessMissedBlocksCard.summary", {
                  missed: totals.missed.toLocaleString(locale),
                  witnesses: totals.witnessCount.toLocaleString(locale),
                })}
              </p>
              {range === "today" && (
                <span className="ms-auto flex-shrink-0 text-[10px] text-gray-400">
                  {t("witnessMissedBlocksCard.soFar")}
                </span>
              )}
            </div>

            {rows.slice(0, CARD_ROWS).map((row) => (
              <TooltipProvider key={row.producer}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-help items-center gap-2 rounded px-1 py-1 transition-colors hover:bg-explorer-extra-light-gray">
                      <HiveAvatar
                        accountName={row.producer}
                        size={22}
                        alt={row.producer}
                        className="shrink-0 rounded-full"
                      />
                      <Link
                        href={"/@" + row.producer}
                        className="min-w-0 flex-grow truncate text-link text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.producer}
                      </Link>
                      {row.isActive && (
                        <span className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 text-[9px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                          {t("witnessMissedBlocksCard.active")}
                        </span>
                      )}
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-explorer-dark-gray dark:text-text">
                        {row.missedCount.toLocaleString(locale)}
                      </span>
                      <span className="w-11 shrink-0 text-end text-[10px] tabular-nums text-gray-500">
                        {formatMissRate(row.rate, locale)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent
                      side="top"
                      align="end"
                      collisionPadding={8}
                      className="max-w-[240px] text-center text-[11px]"
                    >
                      <span className="block">
                        {row.producedCount > 0
                          ? t("witnessMissedBlocksCard.rowTooltip", {
                              missed: row.missedCount.toLocaleString(locale),
                              produced:
                                row.producedCount.toLocaleString(locale),
                              rate: formatMissRate(row.rate, locale),
                            })
                          : t(
                              "witnessMissedBlocksCard.rowTooltipNoneProduced",
                              {
                                missed: row.missedCount.toLocaleString(locale),
                              }
                            )}
                      </span>
                      {row.lastMissedBlock > 0 && (
                        <span className="mt-1 block text-gray-400">
                          {t("witnessMissedBlocksCard.lastMissedDetail", {
                            block: row.lastMissedBlock.toLocaleString(locale),
                            when: formatAndDelocalizeTime(row.lastMissedAt),
                          })}
                        </span>
                      )}
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </CardContent>

      <WitnessMissedBlocksFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialRange={range}
      />
    </Card>
  );
};

export default WitnessMissedBlocksCard;
