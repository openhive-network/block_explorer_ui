import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountRecurrentTransfers = (
  accountName: string,
  liveDataEnabled: boolean
) => {
  const {
    data: recurrentTransfers,
    isLoading: isRecurrentTransfersDataLoading,
    isError: isRecurrentTransfersDataError,
  }: UseQueryResult<Hive.AccountRecurrentBalanceTransfersResponse> = useQuery({
    queryKey: ["account_recurrent_transfers", accountName, liveDataEnabled],
    queryFn: () => fetchingService.getAccountRecurrentTransfers(accountName),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
  });

  return {
    recurrentTransfers,
    isRecurrentTransfersDataLoading,
    isRecurrentTransfersDataError,
  };
};

export default useAccountRecurrentTransfers;
