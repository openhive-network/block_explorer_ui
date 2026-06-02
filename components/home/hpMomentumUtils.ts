import type { IHiveChainInterface } from "@hiveio/wax";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import Hive from "@/types/Hive";
import { grabNumericValue } from "@/utils/StringUtils";
import { computeVestingRatios, type VestingRatios } from "@/utils/Calculations";
import { useSettings } from "@/contexts/SettingsContext";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";

export type VestingDisplayUnit = "hp" | "vests";

export interface HpMomentumChartPoint {
  date: Date | string;
  power_up: number;
  power_down_fill: number;
  power_down_init: number;
  net: number;
  power_up_count?: number;
  power_down_init_count?: number;
  power_down_fill_count?: number;
}

export const VESTING_COLORS = {
  up: "#10B981",
  downFill: "#EF4444",
  downInit: "#F59E0B",
  net: "#3B82F6",
} as const;

export const formatCompact = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    return (
      sign +
      (abs / 1_000_000_000).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }) +
      "B"
    );
  }
  if (abs >= 1_000_000) {
    return (
      sign +
      (abs / 1_000_000).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }) +
      "M"
    );
  }
  if (abs >= 1_000) {
    return (
      sign +
      (abs / 1_000).toLocaleString(undefined, {
        maximumFractionDigits: 1,
      }) +
      "K"
    );
  }
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

export const makeSupplyToNumber = (
  hiveChain: IHiveChainInterface | null | undefined
): ((supply: Hive.Supply | null | undefined) => number) | null => {
  if (!hiveChain) return null;
  return (supply) => {
    if (!supply || !supply.amount || supply.amount === "0") return 0;
    return grabNumericValue(hiveChain.formatter.format(supply));
  };
};

export interface VestingTotals {
  up: number;
  downFill: number;
  downInit: number;
  net: number;
  upCount: number;
  downFillCount: number;
  downInitCount: number;
}

export interface AggregatedVestingStats {
  chartData: HpMomentumChartPoint[];
  totals: VestingTotals;
}

const EMPTY_TOTALS: VestingTotals = {
  up: 0,
  downFill: 0,
  downInit: 0,
  net: 0,
  upCount: 0,
  downFillCount: 0,
  downInitCount: 0,
};

export interface AggregateVestingBucketsArgs {
  buckets:
    | Hive.VestingStatsResponse[]
    | Hive.AccountVestingStatsResponse[]
    | null
    | undefined;
  unit: VestingDisplayUnit;
  supplyToNumber: ((supply: Hive.Supply | null | undefined) => number) | null;
  ratios: VestingRatios | null;
}

// Walks the daily-bucket array from the balance-tracker vesting-stats
// endpoint, picks the right field per `unit` (HIVE vs VESTS), and produces
// the chart points + summed totals. Same logic is consumed by the global
// home card and the per-account sidebar card.
export const aggregateVestingBuckets = ({
  buckets,
  unit,
  supplyToNumber,
  ratios,
}: AggregateVestingBucketsArgs): AggregatedVestingStats => {
  if (!buckets || !supplyToNumber || !ratios) {
    return { chartData: [], totals: { ...EMPTY_TOTALS } };
  }

  let upTotal = 0;
  let downFillTotal = 0;
  let downInitTotal = 0;
  let upCount = 0;
  let downFillCount = 0;
  let downInitCount = 0;

  const chartData: HpMomentumChartPoint[] = buckets.map((row) => {
    const upHive = supplyToNumber(row.power_up_hive);
    const downFillHive = supplyToNumber(row.power_down_fill_hive);
    const downInitVests = supplyToNumber(row.power_down_init_vests);

    // HP mode: HIVE in/out IS HP-equivalent at the moment of op; init's
    // queued VESTS converts to HP via the current global rate.
    // VESTS mode: API returns raw VESTS for init/fill_vests; power_up only
    // ships as HIVE so we approximate via the current rate.
    const up = unit === "hp" ? upHive : upHive * ratios.vestsPerHive;
    const downFill =
      unit === "hp" ? downFillHive : supplyToNumber(row.power_down_fill_vests);
    const downInit =
      unit === "hp" ? downInitVests * ratios.hivePerVests : downInitVests;

    upTotal += up;
    downFillTotal += downFill;
    downInitTotal += downInit;
    upCount += row.power_up_count ?? 0;
    downFillCount += row.power_down_fill_count ?? 0;
    downInitCount += row.power_down_init_count ?? 0;

    return {
      date: row.date,
      power_up: up,
      power_down_fill: downFill,
      power_down_init: downInit,
      net: up - downFill,
      power_up_count: row.power_up_count,
      power_down_init_count: row.power_down_init_count,
      power_down_fill_count: row.power_down_fill_count,
    };
  });

  return {
    chartData,
    totals: {
      up: upTotal,
      downFill: downFillTotal,
      downInit: downInitTotal,
      net: upTotal - downFillTotal,
      upCount,
      downFillCount,
      downInitCount,
    },
  };
};

// Owns the HP/VESTS display unit and keeps it in sync with the user's global
// display preference. Shared by every vesting card/chart so the toggle logic
// lives in one place.
export const useVestingDisplayUnit = (): [
  VestingDisplayUnit,
  Dispatch<SetStateAction<VestingDisplayUnit>>,
] => {
  const { settings } = useSettings();
  const [unit, setUnit] = useState<VestingDisplayUnit>(
    settings.displayVestHpMode === "vests" ? "vests" : "hp"
  );
  useEffect(() => {
    setUnit(settings.displayVestHpMode === "vests" ? "vests" : "hp");
  }, [settings.displayVestHpMode]);
  return [unit, setUnit];
};

// Wires chain + global ratios into aggregateVestingBuckets so each vesting
// surface only supplies its own fetched buckets. `isReady` is false until the
// conversion inputs (chain + ratios) resolve.
export const useAggregatedVesting = (
  buckets: AggregateVestingBucketsArgs["buckets"],
  unit: VestingDisplayUnit
): AggregatedVestingStats & { isReady: boolean } => {
  const { hiveChain } = useHiveChainContext();
  const { headBlockNumberData } = useHeadBlockNumber();
  const { dynamicGlobalData } = useDynamicGlobal(headBlockNumberData);

  const supplyToNumber = useMemo(
    () => makeSupplyToNumber(hiveChain),
    [hiveChain]
  );
  const ratios = useMemo(
    () => computeVestingRatios(hiveChain, dynamicGlobalData),
    [hiveChain, dynamicGlobalData]
  );
  const { chartData, totals } = useMemo(
    () => aggregateVestingBuckets({ buckets, unit, supplyToNumber, ratios }),
    [buckets, unit, supplyToNumber, ratios]
  );

  return { chartData, totals, isReady: !!supplyToNumber && !!ratios };
};
