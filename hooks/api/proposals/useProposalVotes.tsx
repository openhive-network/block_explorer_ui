import { useInfiniteQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import type Hive from "@/types/Hive";
import { useMemo } from "react";
import { config } from "@/Config";

const VOTE_LIMIT = config.standardPaginationSize;

const useProposalVotes = (proposalId: number) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<Hive.ProposalVote[], Error>({
    queryKey: ["proposalVotes", proposalId],
    
    queryFn: ({ pageParam }) => {
      const startVoter = pageParam || "";
      const start: (string | number)[] = [proposalId, startVoter];
      
      return fetchingService.listProposalVotes(
        start,
        VOTE_LIMIT,
        "by_proposal_voter",
        "ascending",
        "all"
      );
    },

    getNextPageParam: (lastPage) => {
      if (lastPage.length < VOTE_LIMIT) {
        return undefined;
      }
      
      const lastVote = lastPage[lastPage.length - 1];
      return lastVote?.voter;
    },
    
    enabled: typeof proposalId === 'number',
    refetchOnWindowFocus: false,
  });

  const votes = useMemo(() => {
    if (!data?.pages) {
      return [];
    }

    // The first page is always complete and correct.
    const firstPage = data.pages[0] || [];
    
    // For all subsequent pages, we skip the first item because it's a duplicate
    // of the last item from the previous page.
    const subsequentPages = data.pages.slice(1).map(page => page.slice(1)).flat();

    return [...firstPage, ...subsequentPages];
  }, [data]);

  return {
    votes,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useProposalVotes;