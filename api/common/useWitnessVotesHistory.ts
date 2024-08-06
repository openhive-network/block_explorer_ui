import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useWitnessVotesHistory = (
  accountName: string,
  isModalOpen: boolean,
  fromDate: Date,
  toDate: Date
) => {
  const fetchVotesHist = async () =>
    await fetchingService.getWitnessVotesHistory(
      accountName,
      "desc",
      "timestamp",
      100,
      fromDate,
      toDate
    );

  const {
    data: votesHistory,
    isLoading: isVotesHistoryLoading,
    isError: isVotesHistoryError,
    refetch: refetchVotesHistory, 
  }: any = useQuery({
    queryKey: [
      "witness_votes_history",
      accountName,
      isModalOpen,
      fromDate,
      toDate,
    ],
    queryFn: fetchVotesHist,
    enabled: !!accountName && isModalOpen,
    refetchOnWindowFocus: false,
  });

  return { votesHistory, isVotesHistoryLoading, isVotesHistoryError, refetchVotesHistory };
};

export default useWitnessVotesHistory;
