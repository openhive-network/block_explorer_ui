import React from "react";
import { DollarSign, Repeat } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

interface MarketDataStatsProps {
  feedPrice?: number;
  vestsToHiveRatio?: string;
}

const MarketDataStats: React.FC<MarketDataStatsProps> = ({
  feedPrice,
  vestsToHiveRatio,
}) => {
  const { t, locale } = useI18n();

  // Values arrive as "."-separated strings (wax formatter / toFixed); re-render
  // them with the app locale's decimal separator and grouping.
  const formatNum = (value: number | string | undefined, digits: number) => {
    if (value === undefined || value === null || value === "") return "";
    const n = parseFloat(String(value));
    return Number.isFinite(n)
      ? n.toLocaleString(locale, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })
      : String(value);
  };

  return (
    <div
      className="bg-explorer-extra-light-gray rounded-xl border border-gray-400 dark:border-gray-700 shadow-md"
      style={{ padding: "8px 10px" }}
    >
      <div className="flex w-full items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-explorer-dark-gray dark:text-gray-400">
            <DollarSign className="h-3 w-3 shrink-0" />
            <span className="truncate">{t("headBlockCard.feedPrice")}</span>
          </div>
          <div className="mt-0.5 text-sm font-bold tabular-nums text-explorer-dark-gray dark:text-text truncate">
            {formatNum(feedPrice, 3)}
            <span className="ml-1 text-[11px] font-normal text-gray-500">
              HBD
            </span>
          </div>
        </div>

        <div className="mx-2.5 h-8 w-px shrink-0 bg-explorer-light-gray dark:bg-gray-600" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-explorer-dark-gray dark:text-gray-400">
            <Repeat className="h-3 w-3 shrink-0" />
            <span className="truncate">VESTS / HIVE</span>
          </div>
          <div className="mt-0.5 text-sm font-bold tabular-nums text-explorer-dark-gray dark:text-text truncate">
            {formatNum(vestsToHiveRatio, 3)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataStats;
