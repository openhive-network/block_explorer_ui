import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";

const useWitnessVotesHistory = (
  accountName: string,
  isModalOpen: boolean,
  fromDate: Date,
  toDate: Date,
  liveDataEnabled: boolean
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
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  return {
    votesHistory,
    isVotesHistoryLoading,
    isVotesHistoryError,
  };
};

export default useWitnessVotesHistory;
