import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";

const useTotalWalletAddresses = (
  granularity: "daily" | "monthly" | "yearly",
  direction: "asc" | "desc",
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined,
  liveDataEnabled?: boolean
) => {
  const {
    data: walletStats,
    isLoading: isWalletStatsLoading,
    isError: isWalletStatsError,
  }: UseQueryResult<Hive.WalletStatsResponse[] | undefined> = useQuery({
    queryKey: [
      "get_total_wallet_addresses",
      granularity,
      direction,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      fetchingService.getTotalWalletAddresses(
        granularity,
        direction,
        fromDate,
        toDate
      ),
    refetchInterval: liveDataEnabled ? config.mainRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  return {
    walletStats,
    isWalletStatsLoading,
    isWalletStatsError,
  };
};

export default useTotalWalletAddresses;
