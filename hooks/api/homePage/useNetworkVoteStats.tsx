import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";

const useNetworkVoteStats = (
  from?: string,
  to?: string,
  granularity?: "day" | "week" | "month",
  liveDataEnabled?: boolean,
  enabled = true
) => {
  const {
    data: voteStats,
    isLoading: isVoteStatsLoading,
    isError: isVoteStatsError,
  }: UseQueryResult<Hive.NetworkVoteStatsResponse[] | undefined> = useQuery({
    queryKey: ["get_network_vote_stats", from, to, granularity],
    queryFn: () => fetchingService.getNetworkVoteStats(from, to, granularity),
    refetchInterval: liveDataEnabled ? config.mainRefreshInterval : false,
    refetchOnWindowFocus: false,
    enabled,
  });

  return { voteStats, isVoteStatsLoading, isVoteStatsError };
};

export default useNetworkVoteStats;
