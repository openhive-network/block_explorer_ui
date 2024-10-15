import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

const SORT_ASC = "asc";
const SORT_DESC = "desc";

const useWitnessVoters = (
  accountName: string,
  isModalOpen: boolean,
  isAsc: boolean,
  sortKey: string,
  liveDataEnabled: boolean,
  pageNum: number
) => {
  const sortDirection = isAsc ? SORT_ASC : SORT_DESC;

  const {
    data: witnessVoters,
    isLoading: isWitnessVotersLoading,
    isError: isWitnessVotersError,
  }: UseQueryResult<Hive.WitnessVotersResponse> = useQuery({
    queryKey: [
      "witness_voters",
      accountName,
      isModalOpen,
      isAsc,
      sortKey,
      liveDataEnabled,
      pageNum
    ],
    queryFn: () =>
      fetchingService.getWitnessVoters(accountName, sortKey, sortDirection, pageNum),
    enabled: !!accountName && isModalOpen,
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  return {
    witnessVoters,
    isWitnessVotersLoading,
    isWitnessVotersError,
  };
};

export default useWitnessVoters;
