import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import fetchingService from "@/services/FetchingService";

const OP_TYPES = [
  "post",
  "comment",
  "vote",
  "transfer",
  "custom_json",
] as const;

export type DauBreakdownOpType = (typeof OP_TYPES)[number];

export interface DauBreakdownPoint {
  period: string;
  post: number;
  comment: number;
  vote: number;
  transfer: number;
  custom_json: number;
}

const useDauBreakdown = (
  fromBlock: Date | number | undefined,
  toBlock: Date | number | undefined,
  granularity: "day" | "week" | "month",
  enabled: boolean
) => {
  const results = useQueries({
    queries: OP_TYPES.map((opType) => ({
      queryKey: ["dauBreakdown", opType, fromBlock, toBlock, granularity],
      queryFn: () =>
        fetchingService.getDailyActiveUsers(
          fromBlock,
          toBlock,
          granularity,
          opType
        ),
      enabled,
    })),
  });

  const isBreakdownLoading = results.some((r) => r.isLoading);
  const isBreakdownError = results.some((r) => r.isError);

  const breakdownData = useMemo<DauBreakdownPoint[]>(() => {
    if (isBreakdownLoading || isBreakdownError) return [];
    const merged = new Map<string, DauBreakdownPoint>();
    OP_TYPES.forEach((opType, i) => {
      const rows = results[i].data ?? [];
      rows.forEach((row) => {
        if (!merged.has(row.period)) {
          merged.set(row.period, {
            period: row.period,
            post: 0,
            comment: 0,
            vote: 0,
            transfer: 0,
            custom_json: 0,
          });
        }
        merged.get(row.period)![opType] = row.operations;
      });
    });
    return Array.from(merged.values()).sort((a, b) =>
      a.period < b.period ? -1 : 1
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, isBreakdownLoading, isBreakdownError]);

  return { breakdownData, isBreakdownLoading, isBreakdownError };
};

export default useDauBreakdown;
