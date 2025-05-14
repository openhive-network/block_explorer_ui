import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { useHiveChainContext } from "@/contexts/HiveChainContext";

const useAccountRecurrentTransfers = (
  accountName: string,
  liveDataEnabled: boolean
) => {
  const { hiveChain } = useHiveChainContext();
  const {
    data,
    isLoading: isRecurrentTransfersDataLoading,
    isError: isRecurrentTransfersDataError,
  }: UseQueryResult<Hive.AccountRecurrentBalanceTransfersResponse> = useQuery({
    queryKey: ["account_recurrent_transfers", accountName, liveDataEnabled],
    queryFn: () => fetchingService.getAccountRecurrentTransfers(accountName),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
  });

  const mapFormatted = (
    list?: Hive.IncomingRecurrentTransfer[] | Hive.OutgoingRecurrentTransfer[]
  ) => {
    return list?.map((item) => ({
      ...item,
      amount: hiveChain?.formatter.format(item.amount),
    }));
  };

  const recurrentTransfers = {
    ...data,
    incoming_recurrent_transfers: mapFormatted(
      data?.incoming_recurrent_transfers
    ),
    outgoing_recurrent_transfers: mapFormatted(
      data?.outgoing_recurrent_transfers
    ),
  };

  return {
    recurrentTransfers,
    isRecurrentTransfersDataLoading,
    isRecurrentTransfersDataError,
  };
};

export default useAccountRecurrentTransfers;
