import { useQuery } from "@tanstack/react-query";
import moment from "moment";

import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

const useProposalVotesHistory = (
  proposalId: number,
  isModalOpen: boolean,
  page: number,
  fromDate: Date | undefined,
  toDate: Date | undefined,
  fromBlock: number | undefined,
  toBlock: number | undefined,
  voterName: string | undefined,
  direction: "asc" | "desc" = "desc"
) => {
  const isDatesCorrect =
    fromDate && toDate
      ? !moment(fromDate).isSame(toDate) && !moment(fromDate).isAfter(toDate)
      : true;

  const isEnabled =
    proposalId != null &&
    isModalOpen &&
    (isDatesCorrect || !!fromBlock || !!toBlock);

  const {
    data: votesHistory,
    isLoading: isVotesHistoryLoading,
    isError: isVotesHistoryError,
  } = useQuery({
    queryKey: [
      "proposal_votes_history",
      proposalId,
      page,
      fromDate,
      toDate,
      fromBlock,
      toBlock,
      voterName,
      direction,
    ],
    queryFn: () =>
      fetchingService.getProposalVotesHistory(
        proposalId,
        direction,
        page,
        config.standardPaginationSize,
        fromDate,
        toDate,
        fromBlock,
        toBlock,
        voterName
      ),
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  });

  return {
    votesHistory,
    isVotesHistoryLoading,
    isVotesHistoryError,
  };
};

export default useProposalVotesHistory;
