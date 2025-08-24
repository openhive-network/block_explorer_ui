import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

// A high limit to ensure all votes for a single user are fetched in one API call.
const VOTE_FETCH_LIMIT = 1000;

const useProposalVoteCount = (accountName: string) => {
  const {
    data: voteCount,
    isLoading,
    isError,
  } = useQuery<number, Error>({
    queryKey: ["proposalVoteCount", accountName],
    queryFn: async () => {
      const start: (string | number)[] = [accountName, 0];

      const votes = await fetchingService.listProposalVotes(
        start,
        VOTE_FETCH_LIMIT,
        "by_voter_proposal", // Order by voter first, then proposal
        "ascending",
        "all" // Count votes on all proposals (active, inactive, etc.)
      );

      // The API returns votes starting from `accountName`, not just for them.
      // We must filter the results to count only the votes for the specific user.
      const userVotes = votes.filter(
        (vote) => vote.voter === accountName
      );

      return userVotes.length;
    },
    enabled: !!accountName, // Only run the query if accountName is provided
    refetchOnWindowFocus: false,
  });

  return { voteCount, isLoading, isError };
};

export default useProposalVoteCount;