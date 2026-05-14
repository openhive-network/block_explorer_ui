import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import type Hive from "@/types/Hive";
import {
  ProposalSortDirection,
  ProposalStatusFilter,
  ProposalSortOrder,
} from "@/components/proposals/ProposalControls";
import { convertToUTCDate } from "@/utils/TimeUtils";

const PROPOSALS_FETCH_LIMIT = 1000;

export interface ProcessedProposal extends Hive.Proposal {
  status: "active" | "inactive" | "expired";
}

interface UseProposalsProps {
  status: ProposalStatusFilter;
  orderBy: ProposalSortOrder;
  direction?: ProposalSortDirection;
  enabled?: boolean;
}

const useProposals = ({ status, orderBy, direction, enabled = true }: UseProposalsProps) => {
  const {
    data: proposalsData,
    isLoading: isProposalsLoading,
    isError: isProposalsError,
  } = useQuery<ProcessedProposal[], Error>({
    queryKey: ["proposals", status, orderBy, direction],
    queryFn: async () => {
      const rawProposals = await fetchingService.listProposals(
        [],
        PROPOSALS_FETCH_LIMIT,
        orderBy,
        direction ?? "descending",
        status
      );

      return rawProposals
        .filter((p) => p.proposal_id !== 116 && p.proposal_id !== 117)
        .map((proposal) => {
          return {
            ...proposal,
            start_date: convertToUTCDate(proposal.start_date as unknown as string),
            end_date: convertToUTCDate(proposal.end_date as unknown as string),
          } as ProcessedProposal;
        });
    },
    enabled: enabled,
    refetchOnWindowFocus: false,
  });
  return {
    proposalsData: proposalsData || [],
    isProposalsLoading,
    isProposalsError,
  };
};

export default useProposals;