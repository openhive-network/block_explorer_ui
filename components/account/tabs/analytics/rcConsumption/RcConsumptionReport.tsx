import React, { useMemo, useState } from "react";
import { Loader2, Cpu, Activity, Trophy, Info } from "lucide-react";
import moment from "moment";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getOpHexColor } from "@/utils/operationColors";
import { spacesToUnderscores } from "@/utils/StringUtils";
import { formatRc, formatOpLabel } from "@/components/home/networkRcUtils";
import useAccountRcFootprint, {
  RcGroupBy,
} from "@/hooks/api/accountPage/useAccountRcFootprint";
import ReportSearchRanges from "../ReportSearchRanges";
import { BaseReportProps } from "../reportRegistry";
import { useRegisterReportExport } from "../reportExports";
import RcConsumptionDrilldown from "./RcConsumptionDrilldown";

type Metric = "ops" | "rc";
const TOP_N = 15;

const RcConsumptionReport: React.FC<
  BaseReportProps & { fillHeight?: boolean }
> = ({ accountName, widgetId, fillHeight = true }) => {
  const { t, locale } = useI18n();
  const [groupBy, setGroupBy] = useState<RcGroupBy>("op_type");
  const [metric, setMetric] = useState<Metric>("rc");
  // Raw bucket key of the bar currently drilled into (null = none).
  const [selected, setSelected] = useState<string | null>(null);
  const [range, setRange] = useState<{
    from?: Date | number;
    to?: Date | number;
  }>(() => ({
    from: moment().subtract(30, "days").toDate(),
    to: moment().toDate(),
  }));

  const { rcFootprint, isRcFootprintLoading, isRcFootprintError } =
    useAccountRcFootprint(accountName, range.from, range.to, groupBy);

  const displayLabel = (label: string) =>
    groupBy === "op_type" ? formatOpLabel(label) : label;

  const { rows, totalOps, totalRc, topLabel } = useMemo(() => {
    const data = rcFootprint ?? [];
    const totalOps = data.reduce((s, r) => s + r.op_count, 0);
    const totalRc = data.reduce((s, r) => s + r.rc_consumed, 0);
    const val = (r: (typeof data)[number]) =>
      metric === "rc" ? r.rc_consumed : r.op_count;
    const pctOf = (r: (typeof data)[number]) =>
      metric === "rc"
        ? totalRc > 0
          ? (r.rc_consumed / totalRc) * 100
          : 0
        : totalOps > 0
          ? (r.op_count / totalOps) * 100
          : 0;
    const sorted = [...data]
      .sort((a, b) => val(b) - val(a))
      .map((r) => ({
        key: r.label,
        label: displayLabel(r.label),
        value: val(r),
        pct: pctOf(r),
        color: getOpHexColor(r.label),
      }));
    const top = sorted.slice(0, TOP_N);
    const rest = sorted.slice(TOP_N);
    if (rest.length) {
      top.push({
        key: "__other",
        label: t("rcConsumption.other"),
        value: rest.reduce((s, x) => s + x.value, 0),
        pct: rest.reduce((s, x) => s + x.pct, 0),
        color: getOpHexColor("Other"),
      });
    }
    return {
      rows: top,
      totalOps,
      totalRc,
      topLabel: sorted[0]?.label ?? t("rcConsumption.none"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rcFootprint, metric, groupBy, t]);

  const max = Math.max(...rows.map((r) => r.value), 1);
  const fmtVal = (v: number) =>
    metric === "rc" ? formatRc(v, locale) : v.toLocaleString(locale);
  // 2 decimals (99.99% ≠ "100%"); flag non-zero slivers rather than "0%".
  const fmtPct = (p: number) => {
    if (p <= 0) return "0%";
    if (p < 0.01) return "<0.01%";
    return `${p.toLocaleString(locale, { maximumFractionDigits: 2 })}%`;
  };

  const exportDatasets = useMemo(() => {
    const data = rcFootprint ?? [];
    if (!data.length) return [];
    const tOps = data.reduce((s, r) => s + r.op_count, 0);
    const tRc = data.reduce((s, r) => s + r.rc_consumed, 0);
    return [
      {
        name: t("rcConsumption.exportCsv"),
        filename: `${spacesToUnderscores(
          t("analyticsDashboard.rcConsumptionReportTitle")
        )}_${accountName}_${spacesToUnderscores(
          t(
            groupBy === "op_type"
              ? "rcConsumption.byOpType"
              : "rcConsumption.byDapp"
          )
        )}`,
        rows: data.map((r) => ({
          [t("rcConsumption.colLabel")]: displayLabel(r.label),
          [t("rcConsumption.colOps")]: r.op_count,
          [t("rcConsumption.colOpsPct")]:
            tOps > 0 ? (r.op_count / tOps) * 100 : 0,
          [t("rcConsumption.colRc")]: r.rc_consumed,
          [t("rcConsumption.colRcPct")]:
            tRc > 0 ? (r.rc_consumed / tRc) * 100 : 0,
        })),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rcFootprint, accountName, groupBy, t]);
  useRegisterReportExport(widgetId, exportDatasets);

  const isEmpty = !!rcFootprint && rcFootprint.length === 0;

  const kpis = [
    {
      key: "rc",
      Icon: Cpu,
      label: t("rcConsumption.kpiTotalRc"),
      value: formatRc(totalRc, locale),
      info: t("rcConsumption.estimateNote"),
    },
    {
      key: "ops",
      Icon: Activity,
      label: t("rcConsumption.kpiTotalOps"),
      value: totalOps.toLocaleString(locale),
      info: undefined as string | undefined,
    },
    {
      key: "top",
      Icon: Trophy,
      label: t("rcConsumption.kpiTop"),
      value: topLabel,
      info: undefined,
    },
  ];

  return (
    <div className={fillHeight ? "h-full flex flex-col" : ""}>
      <div
        className={
          fillHeight
            ? "flex-1 min-h-0 overflow-y-auto space-y-3 p-1 pr-0.5"
            : "space-y-3 p-1"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <ReportSearchRanges
              onApply={(from, to) => {
                setRange({ from, to });
                setSelected(null);
              }}
              defaultRangeKey="30"
            />
            <SegmentedToggle<RcGroupBy>
              value={groupBy}
              onChange={(g) => {
                setGroupBy(g);
                setSelected(null);
              }}
              size="md"
              ariaLabel={t("rcConsumption.groupBy")}
              options={[
                { value: "op_type", label: t("rcConsumption.byOpType") },
                { value: "app", label: t("rcConsumption.byDapp") },
              ]}
            />
          </div>
          <SegmentedToggle<Metric>
            value={metric}
            onChange={setMetric}
            size="md"
            ariaLabel={t("rcConsumption.metric")}
            options={[
              { value: "ops", label: t("rcConsumption.metricOps") },
              { value: "rc", label: t("rcConsumption.metricRc") },
            ]}
          />
        </div>

        {isRcFootprintLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : isRcFootprintError ? (
          <p className="py-8 text-center text-sm text-red-500">
            {t("common.errorLoadingData")}
          </p>
        ) : !rcFootprint || isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-gray-500">
            <Cpu className="h-8 w-8 opacity-50" />
            <p className="text-sm">{t("rcConsumption.emptyState")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {kpis.map(({ key, Icon, label, value, info }) => (
                <div
                  key={key}
                  className="flex flex-col rounded-md border border-gray-200 bg-theme px-4 py-3 shadow-sm dark:border-gray-700"
                >
                  <div className="mb-1 flex items-start gap-1.5 text-xs text-gray-500">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 break-words">{label}</span>
                    {info && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="shrink-0 cursor-help text-gray-400 hover:text-gray-500">
                              <Info size={11} />
                            </span>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent
                              side="top"
                              className="max-w-[240px] text-center text-[11px] normal-case"
                            >
                              {info}
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="break-words text-base font-semibold">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-gray-200 bg-theme dark:border-gray-700">
              <CardHeaderWithLink
                title={
                  groupBy === "op_type"
                    ? t("rcConsumption.byOpTypeTitle")
                    : t("rcConsumption.byDappTitle")
                }
              />
              <p className="px-2 pt-2 text-[11px] text-gray-500">
                {t("rcConsumption.drilldownHint")}
              </p>
              <div className="space-y-1 p-2">
                {rows.map((r) => {
                  // "Other" and non-custom_json don't map to a timeline bucket.
                  const drillable =
                    r.key !== "__other" &&
                    !(groupBy === "app" && r.key === "non-custom_json");
                  const isSelected = selected === r.key;
                  const bar = (
                    <>
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className="min-w-0 truncate text-[12px] text-explorer-dark-gray dark:text-text"
                          title={r.label}
                        >
                          {r.label}
                        </span>
                        <span className="shrink-0 tabular-nums text-[11px] text-gray-500">
                          {fmtVal(r.value)} · {fmtPct(r.pct)}
                        </span>
                      </div>
                      <div className="relative mt-1 h-2.5 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          className="absolute inset-y-0 start-0 rounded"
                          style={{
                            width: `${Math.max(2, (r.value / max) * 100)}%`,
                            backgroundColor: r.color,
                          }}
                        />
                      </div>
                    </>
                  );
                  return (
                    <div key={r.key}>
                      {drillable ? (
                        <button
                          type="button"
                          onClick={() => setSelected(isSelected ? null : r.key)}
                          aria-expanded={isSelected}
                          className={cn(
                            "block w-full rounded px-1.5 py-1 text-start transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                            isSelected && "bg-gray-100 dark:bg-gray-800"
                          )}
                        >
                          {bar}
                        </button>
                      ) : (
                        <div className="px-1.5 py-1">{bar}</div>
                      )}
                      {isSelected && drillable && (
                        <RcConsumptionDrilldown
                          accountName={accountName}
                          groupBy={groupBy}
                          bucketKey={r.key}
                          label={r.label}
                          color={r.color}
                          fromDate={range.from}
                          toDate={range.to}
                          onClose={() => setSelected(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RcConsumptionReport;
