import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const VOTE_PAGE_SIZE = 100;

const useVoterProposals = (accountName: string) => {
  const {
    data: votedProposalIds,
    isPending: isLoading,
    isError,
  } = useQuery<number[], Error>({
    queryKey: ["voterProposals", accountName],
    queryFn: async () => {
      if (!accountName) return [];

      const ids: number[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await fetchingService.getProposalVotes({
          voter: accountName,
          page,
          pageSize: VOTE_PAGE_SIZE,
        });
        ids.push(...response.votes.map((vote) => vote.proposal.proposal_id));
        totalPages = response.total_pages;
        page += 1;
      } while (page <= totalPages);

      return ids;
    },
    enabled: !!accountName,
    refetchOnWindowFocus: false,
  });

  return { votedProposalIds, isLoading, isError };
};

export default useVoterProposals;
