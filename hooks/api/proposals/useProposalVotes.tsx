import { useInfiniteQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import type Hive from "@/types/Hive";
import { useMemo } from "react";
import { config } from "@/Config";
import { ApiAccount } from '@hiveio/wax';

const VOTE_LIMIT = config.proposalVotesSize;

export interface EnrichedProposalVote extends Hive.ProposalVote {
  accountDetails: ApiAccount | null;
}

const useProposalVotes = (proposalId: number, enabled: boolean) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<EnrichedProposalVote[], Error>({
    queryKey: ["proposalVotesWithDetails", proposalId],
    queryFn: async ({ pageParam }) => {
      const startVoter = pageParam || "";
      const start: (string | number)[] = [proposalId, startVoter];
      
      // Step 1: Fetch the raw data
      const votesPage = await fetchingService.listProposalVotes(
        start, VOTE_LIMIT, "by_proposal_voter", "ascending", "all"
      );

      // Check to filter out any votes that don't match the requested proposalId which can happen from API
      const filteredVotesPage = votesPage.filter(vote => {
        const isMatch = vote.proposal.proposal_id === proposalId;
        return isMatch;
      });

      if (filteredVotesPage.length === 0) {
        return [];
      }

      // Step 2: Fetch account details using the SAFE, filtered list.
      const voterNames = filteredVotesPage.map(v => v.voter);
      const accountsResponse = await fetchingService.findAccounts(voterNames);
      const accountsMap = new Map<string, ApiAccount>();
      if (accountsResponse?.accounts) {
        accountsResponse.accounts.forEach(acc => accountsMap.set(acc.name, acc));
      }

      // Step 3: Combine the data using the SAFE, filtered list.
      const enrichedPage = filteredVotesPage.map(vote => ({
        ...vote,
        accountDetails: accountsMap.get(vote.voter) || null,
      }));

      return enrichedPage;
    },

    getNextPageParam: (lastPage) => {
      if (lastPage.length < VOTE_LIMIT) {
        return undefined;
      }
      const lastVote = lastPage[lastPage.length - 1];
      return lastVote?.voter;
    },
    
    enabled: enabled && typeof proposalId === 'number',
    refetchOnWindowFocus: false,
  });

  const votes = useMemo(() => {
    if (!data?.pages) return [];
    const allVotes = data.pages.flat();
    const uniqueVotesMap = new Map<string, EnrichedProposalVote>();
    for (const vote of allVotes) {
      uniqueVotesMap.set(vote.voter, vote);
    }
    return Array.from(uniqueVotesMap.values());
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