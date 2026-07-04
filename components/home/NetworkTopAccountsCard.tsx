import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { IHiveChainInterface } from "@hiveio/wax";
import { useI18n } from "@/i18n/i18n";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { convertVestsToHP } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import moment from "moment";
import useNetworkTopAccounts from "@/hooks/api/homePage/useNetworkTopAccounts";
import Hive from "@/types/Hive";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { useVestingDisplayUnit, VestingDisplayUnit } from "./hpMomentumUtils";

// ---------------------------------------------------------------------------
// Shared helpers for the Network Top Accounts feature (card + dialog).
// Kept in this file for now; the dialog imports what it needs from here.
// ---------------------------------------------------------------------------

export type PrimaryUnit = "HP" | "VESTS" | "HIVE" | "count";

// Mirrors hpMomentumUtils' VestingDisplayUnit.
export type VestingUnit = "hp" | "vests";

const VESTING_METRICS: Hive.TopAccountsMetric[] = [
  "author_rewards",
  "curation_rewards",
  "hp_balance",
];

export const metricIsVesting = (metric: Hive.TopAccountsMetric): boolean =>
  VESTING_METRICS.includes(metric);

export interface TopAccountsMetricDef {
  key: Hive.TopAccountsMetric;
  labelKey: string;
  // hp_balance ignores from_date/to_date on the server.
  usesDate: boolean;
}

export const TOP_ACCOUNTS_METRICS: TopAccountsMetricDef[] = [
  {
    key: "author_rewards",
    labelKey: "topAccountsCard.authorRewards",
    usesDate: true,
  },
  {
    key: "curation_rewards",
    labelKey: "topAccountsCard.curationRewards",
    usesDate: true,
  },
  {
    key: "transfer_volume_in",
    labelKey: "topAccountsCard.transfersIn",
    usesDate: true,
  },
  {
    key: "transfer_volume_out",
    labelKey: "topAccountsCard.transfersOut",
    usesDate: true,
  },
  { key: "hp_balance", labelKey: "topAccountsCard.hpBalance", usesDate: false },
  {
    key: "transaction_count",
    labelKey: "topAccountsCard.txCount",
    usesDate: true,
  },
];

export const metricUsesDate = (metric: Hive.TopAccountsMetric): boolean =>
  TOP_ACCOUNTS_METRICS.find((m) => m.key === metric)?.usesDate ?? true;

// Wax-backed converters for a leaderboard row. All amounts come from the API as
// raw nai integers; we build the matching wax asset and let wax do the maths —
// vests->HP always goes through the shared convertVestsToHP helper.
export interface TopAccountsConverters {
  toHp: (vestsNai: number) => number;
  toVests: (vestsNai: number) => number;
  toHive: (hiveNai: number) => number;
  toHbd: (hbdNai: number) => number;
  // Total network HP (== total_vesting_fund_hive), for share-of-network stats.
  networkHp: number;
}

export const makeConverters = (
  hiveChain: IHiveChainInterface | null | undefined,
  dynamicGlobalData: any
): TopAccountsConverters | null => {
  if (!hiveChain || !dynamicGlobalData) return null;
  const { rawTotalVestingFundHive, rawTotalVestingShares } =
    dynamicGlobalData.headBlockDetails;
  return {
    networkHp: rawTotalVestingFundHive
      ? grabNumericValue(hiveChain.formatter.format(rawTotalVestingFundHive))
      : 0,
    toHp: (vestsNai) => {
      const hp = convertVestsToHP(
        hiveChain,
        hiveChain.vests(vestsNai),
        rawTotalVestingFundHive,
        rawTotalVestingShares
      );
      return hp ? grabNumericValue(hp) : 0;
    },
    toVests: (vestsNai) =>
      grabNumericValue(hiveChain.formatter.format(hiveChain.vests(vestsNai))),
    toHive: (hiveNai) =>
      grabNumericValue(hiveChain.formatter.format(hiveChain.hive(hiveNai))),
    toHbd: (hbdNai) =>
      grabNumericValue(hiveChain.formatter.format(hiveChain.hbd(hbdNai))),
  };
};

// The single value a row is ranked by, plus the unit to render alongside it.
// For vesting metrics the display unit follows the user's HP/VESTS preference.
export const getPrimaryValue = (
  row: Hive.TopAccountsResponse,
  metric: Hive.TopAccountsMetric,
  conv: TopAccountsConverters | null,
  unit: VestingUnit = "hp"
): { value: number; unit: PrimaryUnit } => {
  switch (metric) {
    case "author_rewards":
    case "curation_rewards":
    case "hp_balance":
      return unit === "vests"
        ? { value: conv?.toVests(row.value_vests_nai) ?? 0, unit: "VESTS" }
        : { value: conv?.toHp(row.value_vests_nai) ?? 0, unit: "HP" };
    case "transfer_volume_in":
    case "transfer_volume_out":
      return { value: conv?.toHive(row.value_hive_nai) ?? 0, unit: "HIVE" };
    case "transaction_count":
    default:
      return { value: row.op_count, unit: "count" };
  }
};

// Concentration headline: combined primary value across the shown rows, plus
// (for hp_balance) the group's share of total network HP.
export interface SummaryStats {
  combined: number;
  combinedUnit: PrimaryUnit;
  pct: number | null;
}

export const getSummaryStats = (
  rows: Hive.TopAccountsResponse[],
  metric: Hive.TopAccountsMetric,
  conv: TopAccountsConverters | null,
  unit: VestingUnit = "hp"
): SummaryStats => {
  let combined = 0;
  let combinedUnit: PrimaryUnit = "count";
  for (const row of rows) {
    const { value, unit: u } = getPrimaryValue(row, metric, conv, unit);
    combined += value;
    combinedUnit = u;
  }
  let pct: number | null = null;
  if (metric === "hp_balance" && conv && conv.networkHp > 0) {
    const combinedHp = rows.reduce(
      (sum, row) => sum + (conv.toHp(row.value_vests_nai) ?? 0),
      0
    );
    pct = (combinedHp / conv.networkHp) * 100;
  }
  return { combined, combinedUnit, pct };
};

// i18n key for the summary verb phrasing, per metric.
export const summaryKeyForMetric = (metric: Hive.TopAccountsMetric): string => {
  switch (metric) {
    case "hp_balance":
      return "topAccountsCard.summaryHold";
    case "transfer_volume_in":
    case "transfer_volume_out":
      return "topAccountsCard.summaryMoved";
    case "transaction_count":
      return "topAccountsCard.summarySigned";
    default:
      return "topAccountsCard.summaryEarned";
  }
};

// Compact numeric formatting (e.g. 12.8M) with the unit appended.
// A unit of "count" renders the bare number (no suffix).
export const formatMetricValue = (
  value: number,
  unit: string,
  locale: string
): string => {
  const num = value.toLocaleString(locale, {
    notation: value >= 100_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 100_000 ? 2 : 0,
  });
  return unit === "count" ? num : `${num} ${unit}`;
};

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

const NetworkTopAccountsFullChartDialog = dynamic(
  () => import("./NetworkTopAccountsFullChartDialog"),
  { ssr: false }
);

const CARD_LIMIT = 10;

const NetworkTopAccountsCard: React.FC = () => {
  const { t, locale } = useI18n();
  const [metric, setMetric] =
    useState<Hive.TopAccountsMetric>("author_rewards");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unit, setUnit] = useVestingDisplayUnit();
  const showUnitToggle = metricIsVesting(metric);

  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();
  const converters = useMemo(
    () => makeConverters(hiveChain, dynamicGlobalData),
    [hiveChain, dynamicGlobalData]
  );
  // Vesting/transfer values need the wax converters; transaction_count doesn't.
  // Until ready, keep the card in its loading state so it never shows "0 HP".
  const valuesReady = metric === "transaction_count" || converters !== null;

  const usesDate = metricUsesDate(metric);
  const fromDate = useMemo(() => moment().subtract(30, "days").toDate(), []);
  const toDate = useMemo(() => moment().toDate(), []);

  const { topAccounts, isTopAccountsLoading, isTopAccountsError } =
    useNetworkTopAccounts(
      metric,
      usesDate ? fromDate : undefined,
      usesDate ? toDate : undefined,
      CARD_LIMIT
    );

  const rows = useMemo(() => {
    if (!topAccounts) return [];
    return topAccounts.map((row) => {
      const { value, unit: valueUnit } = getPrimaryValue(
        row,
        metric,
        converters,
        unit
      );
      const opsLabel =
        metric !== "transaction_count" && row.op_count > 0
          ? `${row.op_count.toLocaleString(locale)} ${t("topAccountsCard.ops")}`
          : null;
      return {
        row,
        valueLabel: formatMetricValue(value, valueUnit, locale),
        opsLabel,
      };
    });
  }, [topAccounts, metric, converters, unit, locale, t]);

  const summaryText = useMemo(() => {
    if (!topAccounts || topAccounts.length === 0) return null;
    const { combined, combinedUnit, pct } = getSummaryStats(
      topAccounts,
      metric,
      converters,
      unit
    );
    let text = t(summaryKeyForMetric(metric), {
      count: topAccounts.length,
      value: formatMetricValue(combined, combinedUnit, locale),
    });
    if (pct !== null) {
      text += ` · ${t("topAccountsCard.ofNetwork", {
        pct: pct.toLocaleString(locale, { maximumFractionDigits: 1 }),
      })}`;
    }
    return text;
  }, [topAccounts, metric, converters, unit, locale, t]);

  const unitOptions: { key: VestingDisplayUnit; label: string }[] = [
    { key: "hp", label: "HP" },
    { key: "vests", label: "VESTS" },
  ];

  return (
    <Card
      className="col-span-12 md:col-span-11 lg:col-span-3 overflow-hidden flex flex-col mb-2"
      data-testid="top-accounts-sidebar"
    >
      <CardHeaderWithLink
        title={t("topAccountsCard.title")}
        onSeeMore={() => setIsModalOpen(true)}
        linkTestId="top-accounts-see-more-btn"
        className="border-b-0 pb-0"
      />
      <div className="space-y-2 border-b px-3 pb-2 pt-1">
        <div className="flex items-center gap-2">
          <Select
            value={metric}
            onValueChange={(v) => setMetric(v as Hive.TopAccountsMetric)}
          >
            <SelectTrigger className="h-8 flex-1 gap-1.5 rounded-full border-0 bg-indigo-50 px-3.5 text-xs font-semibold text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-200 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-200 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/25">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {TOP_ACCOUNTS_METRICS.map(({ key, labelKey }) => (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-md text-xs font-medium"
                >
                  {t(labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showUnitToggle && (
            <SegmentedToggle
              ariaLabel="HP or VESTS"
              value={unit}
              onChange={setUnit}
              options={unitOptions.map((o) => ({
                value: o.key,
                label: o.label,
              }))}
            />
          )}
        </div>
      </div>

      <CardContent className="px-2 py-3 flex-grow">
        {isTopAccountsLoading ? (
          <div className="flex items-center justify-center min-h-[220px]">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : isTopAccountsError ? (
          <p className="text-red-500 text-sm text-center py-8">
            {t("common.errorLoadingData")}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            {t("common.noDataAvailable")}
          </p>
        ) : (
          <div className="flex flex-col">
            {(summaryText || metricUsesDate(metric)) && (
              <div className="flex items-baseline gap-2 px-1 pb-2 mb-1 border-b">
                {summaryText && (
                  <p className="min-w-0 text-[11px] text-gray-500">
                    {summaryText}
                  </p>
                )}
                {metricUsesDate(metric) && (
                  <span className="ms-auto flex-shrink-0 text-[10px] text-gray-400">
                    {t("topAccountsCard.last30d")}
                  </span>
                )}
              </div>
            )}
            {rows.map(({ row, valueLabel, opsLabel }) => (
              <div
                key={row.account}
                className="flex items-center gap-2 py-1.5 px-1 rounded hover:bg-explorer-extra-light-gray transition-colors"
              >
                <span className="w-5 text-center text-xs font-semibold text-gray-500 shrink-0">
                  {row.rank}
                </span>
                <Link href={`/@${row.account}`} className="shrink-0">
                  <Image
                    className="rounded-full"
                    src={getHiveAvatarUrl(row.account)}
                    alt={row.account}
                    width={28}
                    height={28}
                  />
                </Link>
                <div className="flex flex-col flex-grow min-w-0">
                  <Link
                    href={`/@${row.account}`}
                    className="text-link text-sm truncate"
                    title={row.account}
                  >
                    {row.account}
                  </Link>
                  {opsLabel && (
                    <span className="text-[10px] text-gray-500 leading-tight">
                      {opsLabel}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-explorer-dark-gray dark:text-text shrink-0">
                  {valueLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <NetworkTopAccountsFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMetric={metric}
      />
    </Card>
  );
};

export default NetworkTopAccountsCard;
