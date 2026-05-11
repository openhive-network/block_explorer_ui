import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useWatchedProposals = (ids: number[]) => {
  const sortedKey = [...ids].sort((a, b) => a - b).join(",");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["watched_proposals", sortedKey],
    queryFn: async () => {
      const raw = await fetchingService.getProposal(ids);
      return raw.map((p) => ({
        ...p,
        start_date: new Date(p.start_date),
        end_date: new Date(p.end_date),
      }));
    },
    enabled: ids.length > 0,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return { watchedProposals: data ?? [], isLoading, isError };
};

export default useWatchedProposals;
