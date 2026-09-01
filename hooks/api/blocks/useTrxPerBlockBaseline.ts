import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { computePerBlockBaseline } from "@/utils/blockBaseline";

const BASELINE_DAYS = 30;

// transaction-statistics, not operation-type-statistics: only the former is
// served by the public nodes. Keyed to the day so visitors share one entry.
const useTrxPerBlockBaseline = (enabled: boolean = true) => {
  const dayKey = new Date().toISOString().slice(0, 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["blocks_trx_per_block_baseline", dayKey, BASELINE_DAYS],
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - BASELINE_DAYS);
      const rows = await fetchingService.getTransactionStatistics(
        "daily",
        "asc",
        from,
        to
      );

      return computePerBlockBaseline(
        (rows ?? []).map((row) => ({
          value: row.trx_count,
          last_block_num: row.last_block_num,
        }))
      );
    },
  });

  return {
    baseline: data ?? null,
    isBaselineLoading: enabled && isLoading,
    isBaselineUnavailable: !!error,
    baselineDays: BASELINE_DAYS,
  };
};

export default useTrxPerBlockBaseline;
