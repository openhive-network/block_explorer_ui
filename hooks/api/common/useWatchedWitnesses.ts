import { useQueries } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";

export interface WatchedWitnessHealth {
  name: string;
  isActive: boolean;
  rank: number;
  missedBlocks: number;
  version: string;
  feedUpdatedAt: Date | null;
  priceFeed: number;
  isLoading: boolean;
}

const useWatchedWitnesses = (
  names: string[]
): { witnesses: WatchedWitnessHealth[]; isLoading: boolean } => {
  const queries = useQueries({
    queries: names.map((name) => ({
      queryKey: ["witnessHealth", name],
      queryFn: () => fetchingService.getWitness(name),
      staleTime: 60000,
      refetchOnWindowFocus: false,
    })),
  });

  const witnesses: WatchedWitnessHealth[] = names.map((name, i) => {
    const q = queries[i];
    const data = q.data as Hive.SingleWitnessResponse | undefined;
    return {
      name,
      isActive: data ? data.signing_key !== config.inactiveWitnessKey : true,
      rank: data?.rank ?? 0,
      missedBlocks: data?.missed_blocks ?? 0,
      version: data?.version ?? "",
      feedUpdatedAt: data?.feed_updated_at ? new Date(data.feed_updated_at) : null,
      priceFeed: data?.price_feed ?? 0,
      isLoading: q.isLoading,
    };
  });

  return {
    witnesses,
    isLoading: names.length > 0 && queries.some((q) => q.isLoading),
  };
};

export default useWatchedWitnesses;
