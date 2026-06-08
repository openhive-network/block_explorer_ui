import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import moment from "moment";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";

const STALE_MS = 5 * 60 * 1000;

const useProposalVotesHistoryChart = (
  proposalId: number,
  isModalOpen: boolean,
  fromDate: Date | undefined,
  toDate: Date | undefined,
  fromBlock: number | undefined,
  toBlock: number | undefined,
  voterName: string | undefined
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
    data: firstPage,
    isLoading: isFirstLoading,
    isError: isFirstError,
  } = useQuery({
    queryKey: [
      "proposal_votes_history_chart",
      proposalId,
      1,
      fromDate,
      toDate,
      fromBlock,
      toBlock,
      voterName,
    ],
    queryFn: () =>
      fetchingService.getProposalVotesHistory(
        proposalId,
        "asc",
        1,
        config.standardPaginationSize,
        fromDate,
        toDate,
        fromBlock,
        toBlock,
        voterName
      ),
    enabled: isEnabled,
    staleTime: STALE_MS,
    refetchOnWindowFocus: false,
  });

  const totalPages = firstPage?.total_pages ?? 0;

  const remainingQueries = useQueries({
    queries: Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      queryKey: [
        "proposal_votes_history_chart",
        proposalId,
        i + 2,
        fromDate,
        toDate,
        fromBlock,
        toBlock,
        voterName,
      ],
      queryFn: () =>
        fetchingService.getProposalVotesHistory(
          proposalId,
          "asc",
          i + 2,
          config.standardPaginationSize,
          fromDate,
          toDate,
          fromBlock,
          toBlock,
          voterName
        ),
      enabled: isEnabled && totalPages > 1,
      staleTime: STALE_MS,
      refetchOnWindowFocus: false,
    })),
  });

  const chartRawData = useMemo(() => {
    if (!firstPage) return undefined;
    const allVotes = [...firstPage.votes_history];
    for (const q of remainingQueries) {
      if (q.data?.votes_history) allVotes.push(...q.data.votes_history);
    }
    return { ...firstPage, votes_history: allVotes };
  }, [firstPage, remainingQueries]);

  const isChartLoading =
    isFirstLoading || remainingQueries.some((q) => q.isLoading);

  const isChartError = isFirstError || remainingQueries.some((q) => q.isError);

  return { chartRawData, isChartLoading, isChartError };
};

export default useProposalVotesHistoryChart;
