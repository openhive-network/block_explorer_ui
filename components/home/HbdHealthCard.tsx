import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import { Info, Loader2 } from "lucide-react";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/hybrid-tooltip";
import { useI18n } from "../../i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import useHbdHealth from "@/hooks/api/homePage/useHbdHealth";
import HbdHealthChart, {
  GROSS_COLOR,
  INTEREST_COLOR,
  PROTOCOL_COLOR,
} from "./HbdHealthChart";

const HbdHealthFullChartDialog = dynamic(
  () => import("./HbdHealthFullChartDialog"),
  { ssr: false }
);

const InfoTip: React.FC<{ text: string }> = ({ text }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={text}
          className="shrink-0 cursor-help text-gray-400 hover:text-gray-500"
        >
          <Info size={11} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[260px] text-center text-[11px]"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const HbdHealthCard = () => {
  const { t, locale } = useI18n();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Two years of monthly samples, plus the live row.
  const fromDate = useMemo(
    () => moment.utc().subtract(24, "months").startOf("month").toDate(),
    []
  );
  const { points, isLoading, isError } = useHbdHealth(
    "monthly",
    fromDate,
    undefined,
    settings.liveData
  );
  const latest = points.length ? points[points.length - 1] : null;

  const pct = (v: number | null | undefined, digits = 2) =>
    v === null || v === undefined
      ? "–"
      : `${v.toLocaleString(locale, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })}%`;

  const kpis = [
    {
      key: "protocol",
      label: t("hbdHealthCard.protocolRatio"),
      info: t("hbdHealthCard.protocolRatioInfo"),
      value: pct(latest?.protocolPct),
      color: PROTOCOL_COLOR,
      note:
        latest?.protocolPct === null
          ? t("hbdHealthCard.protocolUnavailable")
          : undefined,
    },
    {
      key: "gross",
      label: t("hbdHealthCard.grossShare"),
      info: t("hbdHealthCard.grossShareInfo", {
        // About 72% when measured (Nov 2026); used until the treasury rows load.
        pct: Math.round(latest?.treasurySharePct ?? 72),
      }),
      value: pct(latest?.grossPct),
      color: GROSS_COLOR,
    },
    {
      key: "interest",
      label: t("hbdHealthCard.interestRate"),
      info: t("hbdHealthCard.interestRateInfo"),
      value: pct(latest?.interestRatePct),
      color: INTEREST_COLOR,
    },
  ];

  return (
    <div
      className="bg-theme rounded mb-2 shadow-md overflow-hidden"
      data-testid="hbd-health-card"
    >
      <CardHeaderWithLink
        title={t("widgets.hbdHealthName")}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {t("common.fullChart")}
          </button>
        }
      />
      <div className="p-2 space-y-2">
        <div className="flex flex-wrap gap-2">
          {kpis.map(({ key, label, info, value, color, note }) => (
            <div
              key={key}
              data-testid={`hbd-health-${key}`}
              className="flex-1 min-w-[140px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center"
            >
              <h3 className="flex items-start gap-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                <span
                  aria-hidden
                  className="mt-[3px] inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{label}</span>
                <InfoTip text={info} />
              </h3>
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mt-1" />
              ) : isError ? (
                <p className="text-red-500 text-[11px] mt-1">
                  {t("common.errorLoadingData")}
                </p>
              ) : (
                <>
                  <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text tabular-nums">
                    {value}
                  </p>
                  {note && <p className="text-[11px] text-gray-500">{note}</p>}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md">
          <p className="text-[11px] text-gray-500 mb-1">
            {t("hbdHealthCard.last24Months")}
          </p>
          <div className="h-[120px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin h-5 w-5" />
              </div>
            ) : isError || points.length === 0 ? (
              <p className="flex items-center justify-center h-full text-gray-500 text-xs">
                {isError
                  ? t("common.errorLoadingData")
                  : t("common.noDataAvailable")}
              </p>
            ) : (
              <HbdHealthChart data={points} granularity="monthly" compact />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <HbdHealthFullChartDialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default HbdHealthCard;
