import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useFindProposal = (proposalId: number | null) => {
  const {
    data: foundProposalData,
    isLoading: isFindProposalLoading,
    isError: isFindProposalError,
  }: UseQueryResult<Hive.Proposal[]> = useQuery({
    queryKey: ["find_proposal", proposalId],
    queryFn: async () => {
      if (proposalId === null) return Promise.resolve([]);

      // 1. Fetch the raw data
      const rawProposals = await fetchingService.getProposal([proposalId]);

      // 2. Map over the results and convert date strings to Date objects
      return rawProposals.map((proposal) => {
        return {
          ...proposal,
          start_date: new Date(proposal.start_date),
          end_date: new Date(proposal.end_date),
        };
      });
    },
    enabled: proposalId !== null,
    refetchOnWindowFocus: false,
  });
  return { foundProposalData, isFindProposalLoading, isFindProposalError };
};

export default useFindProposal;