import { useQuery } from "@tanstack/react-query";
import moment from "moment";

import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

const useWitnessVotesHistory = (
  accountName: string,
  isModalOpen: boolean,
  fromDate: Date,
  toDate: Date,
  liveDataEnabled: boolean
) => {
  const isDatesCorrect =
    !moment(fromDate).isSame(toDate) && !moment(fromDate).isAfter(toDate);

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
      liveDataEnabled,
    ],
    queryFn: fetchVotesHist,
    enabled: !!accountName && isModalOpen && isDatesCorrect,
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
