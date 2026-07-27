import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

// Per-id custom_json usage over time. Only fires once a json_id is selected.
const useNetworkCustomJsonUsage = (
  jsonId: string | null,
  from?: string | Date | number,
  to?: string | Date | number,
  granularity: "day" | "week" | "month" = "day",
  // Exploratory drill-down (full-chart dialog) — never gate the widget on it.
  skipNodeSupportGate = false
) => {
  const {
    data: customJsonUsage,
    isLoading: isCustomJsonUsageLoading,
    isError: isCustomJsonUsageError,
  }: UseQueryResult<Hive.NetworkCustomJsonUsageRow[] | undefined> = useQuery({
    queryKey: ["networkCustomJsonUsage", jsonId, from, to, granularity],
    queryFn: () =>
      fetchingService.getNetworkCustomJsonUsage({
        json_id: jsonId as string,
        from_date: from,
        to_date: to,
        granularity,
      }),
    enabled: !!jsonId,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    meta: { skipNodeSupportGate },
  });

  return {
    customJsonUsage,
    isCustomJsonUsageLoading,
    isCustomJsonUsageError,
  };
};

export default useNetworkCustomJsonUsage;
