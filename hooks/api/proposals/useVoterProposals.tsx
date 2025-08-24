import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import type Hive from "@/types/Hive";

// High limit to fetch all votes for a user in one go.
const VOTE_FETCH_LIMIT = 1000;

const useVoterProposals = (accountName: string) => {
  const {
    data: votedProposalIds,
    isLoading,
    isError,
  } = useQuery<number[], Error>({
    queryKey: ["voterProposals", accountName],
    queryFn: async () => {
      if (!accountName) return [];

      const start: (string | number)[] = [accountName, 0];

      const votes: Hive.ProposalVote[] = await fetchingService.listProposalVotes(
        start,
        VOTE_FETCH_LIMIT,
        "by_voter_proposal",
        "ascending",
        "all"
      );

      // The API returns votes *starting from* the accountName, so we must filter.
      const userVotes = votes.filter(
        (vote) => vote.voter === accountName
      );

      // We only need the proposal IDs for filtering on the proposals page.
      return userVotes.map((vote) => vote.proposal.proposal_id);
    },
    enabled: !!accountName, // Only run the query if an accountName is provided
    refetchOnWindowFocus: false,
  });

  return { votedProposalIds, isLoading, isError };
};

export default useVoterProposals;