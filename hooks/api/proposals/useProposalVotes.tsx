import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import fetchingService from "@/services/FetchingService";
import type Hive from "@/types/Hive";
import { config } from "@/Config";

const VOTE_LIMIT = config.proposalVotesSize;

const useProposalVotes = (proposalId: number, enabled: boolean) => {
  const {
    data,
    isPending: isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["proposalVotes", proposalId],
    queryFn: ({ pageParam }): Promise<Hive.ProposalVotesResponse> =>
      fetchingService.getProposalVotes({
        proposalId,
        page: pageParam,
        pageSize: VOTE_LIMIT,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      pages.length < lastPage.total_pages ? pages.length + 1 : undefined,
    enabled: enabled && typeof proposalId === "number",
    refetchOnWindowFocus: false,
  });

  const votes = useMemo(() => {
    const uniqueVotes = new Map<string, Hive.ProposalVoteEntry>();
    for (const page of data?.pages ?? []) {
      for (const vote of page.votes) uniqueVotes.set(vote.voter_name, vote);
    }
    return Array.from(uniqueVotes.values());
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
