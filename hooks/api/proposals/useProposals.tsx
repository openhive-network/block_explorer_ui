import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import type Hive from "@/types/Hive";

const PROPOSALS_FETCH_LIMIT = 1000;

export interface ProcessedProposal extends Hive.Proposal {
  status: "active" | "inactive" | "expired";
}

interface UseProposalsProps {
  status: "all" | "active" | "inactive" | "expired";
  orderBy: "by_creator" | "by_start_date" | "by_end_date" | "by_total_votes";
}

const useProposals = ({ status, orderBy }: UseProposalsProps) => {
  const {
    data: proposalsData,
    isLoading: isProposalsLoading,
    isError: isProposalsError,
  } = useQuery<ProcessedProposal[], Error>({
    queryKey: ['proposals', status, orderBy],

    queryFn: async () => {
      const rawProposals = await fetchingService.listProposals(
        [],
        PROPOSALS_FETCH_LIMIT,
        orderBy,
        'descending',
        status
      );

      return rawProposals
        .filter(p => p.proposal_id !== 116 &&  p.proposal_id !== 117)
        .map(proposal => {
          return {
            ...proposal,
            start_date: new Date(proposal.start_date),
            end_date: new Date(proposal.end_date),
          } as ProcessedProposal;
        });
    },
    
    refetchOnWindowFocus: false,
  });

  return {
    proposalsData: proposalsData || [],
    isProposalsLoading,
    isProposalsError,
  };
};

export default useProposals;