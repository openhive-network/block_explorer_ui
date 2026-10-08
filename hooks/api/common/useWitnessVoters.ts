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
  pageNum: number,
  voterName?: string
) => {
  const sortDirection = isAsc ? SORT_ASC : SORT_DESC;

  const {
    data: witnessVoters,
    isLoading: isWitnessVotersLoading,
    isError: isWitnessVotersError,
    isPreviousData: isWitnessVotersRefreshing,
  }: UseQueryResult<Hive.WitnessVotersResponse> = useQuery({
    queryKey: [
      "witness_voters",
      accountName,
      isModalOpen,
      isAsc,
      sortKey,
      liveDataEnabled,
      pageNum,
      voterName,
    ],
    queryFn: () =>
      fetchingService.getWitnessVoters(
        accountName,
        sortKey,
        sortDirection,
        pageNum,
        voterName
      ),
    enabled: !!accountName && isModalOpen,
    // Keeps the dialog in place while a new page, sort or search loads.
    keepPreviousData: true,
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  return {
    witnessVoters,
    isWitnessVotersLoading,
    isWitnessVotersRefreshing,
    isWitnessVotersError,
  };
};

export default useWitnessVoters;
