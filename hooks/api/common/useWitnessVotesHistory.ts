import { useQuery } from "@tanstack/react-query";
import moment from "moment";

import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

const useWitnessVotesHistory = (
  accountName: string,
  isModalOpen: boolean,
  page: number,
  fromDate: Date  | undefined,
  toDate: Date  | undefined,
  fromBlock : number | undefined,
  toBlock: number | undefined,
  voterName: string | undefined,
  liveDataEnabled: boolean,
) => {
  const isDatesCorrect = fromDate && toDate
    ? !moment(fromDate).isSame(toDate) && !moment(fromDate).isAfter(toDate)
    : true;

  const isEnabled = !!accountName && isModalOpen && (isDatesCorrect || !!fromBlock || !!toBlock);

  const {
    data: votesHistory,
    isLoading: isVotesHistoryLoading,
    isError: isVotesHistoryError,
  }: any = useQuery({
    queryKey: [
      "witness_votes_history",
      accountName,
      page,
      fromDate,
      toDate,
      fromBlock,
      toBlock,
      voterName,
     
    ],
    queryFn: () => 
      fetchingService.getWitnessVotesHistory(
        accountName,
        "desc",
        page,
        config.standardPaginationSize,
        fromDate,
        toDate,
        fromBlock,
        toBlock,
        voterName
      ),
    enabled: isEnabled,
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
