import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useProposalVoteCount = (accountName: string, enabled = true) => {
  const {
    data: voteCount,
    isPending: isLoading,
    isError,
  } = useQuery<number, Error>({
    queryKey: ["proposalVoteCount", accountName],
    queryFn: async () => {
      const { total_votes } = await fetchingService.getProposalVotes({
        voter: accountName,
        pageSize: 1,
      });
      return total_votes;
    },
    enabled: enabled && !!accountName,
    refetchOnWindowFocus: false,
  });

  return { voteCount, isLoading, isError };
};

export default useProposalVoteCount;
