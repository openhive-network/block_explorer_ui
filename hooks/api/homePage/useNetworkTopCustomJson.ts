import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useNetworkTopCustomJson = (
  params: Hive.NetworkTopCustomJsonParams,
  enabled = true,
  // Exploratory callers (full-chart dialog) opt out of the node-support gate so
  // a transient timeout on a wide range doesn't gate the whole widget.
  skipNodeSupportGate = false
) => {
  const {
    data: topCustomJson,
    isLoading: isTopCustomJsonLoading,
    isFetching: isTopCustomJsonFetching,
    isError: isTopCustomJsonError,
  }: UseQueryResult<Hive.NetworkTopCustomJsonRow[] | undefined> = useQuery({
    queryKey: [
      "networkTopCustomJson",
      params.from_date,
      params.to_date,
      params.limit_count,
      params.group_by,
      params.order_by,
    ],
    queryFn: () => fetchingService.getNetworkTopCustomJson(params),
    enabled,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    meta: { skipNodeSupportGate },
  });

  return {
    topCustomJson,
    isTopCustomJsonLoading,
    isTopCustomJsonFetching,
    isTopCustomJsonError,
  };
};

export default useNetworkTopCustomJson;
