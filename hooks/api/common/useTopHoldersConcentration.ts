import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { CoinType, BalanceType } from "@/hooks/api/common/useTopHolders";

// Unfiltered top holders for a coin + balance-type (2 pages, ~200 rows) so the
// strip keeps >=100 real holders after excluding treasury/burn accounts.
const useTopHoldersConcentration = (
  coinType: CoinType,
  balanceType: BalanceType
) => {
  const enabled = !(coinType === "VESTS" && balanceType !== "balance");
  const opts = {
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  };
  const page1 = useQuery<Hive.TopHoldersResponse>({
    queryKey: ["topHoldersConcentration", coinType, balanceType, 1],
    queryFn: () => fetchingService.getTopHolders(coinType, balanceType, 1),
    ...opts,
  });
  const page2 = useQuery<Hive.TopHoldersResponse>({
    queryKey: ["topHoldersConcentration", coinType, balanceType, 2],
    queryFn: () => fetchingService.getTopHolders(coinType, balanceType, 2),
    ...opts,
  });

  return {
    holders: [
      ...(page1.data?.holders_result ?? []),
      ...(page2.data?.holders_result ?? []),
    ],
    totalAccounts: page1.data?.total_accounts ?? 0,
    isLoading: page1.isLoading || page2.isLoading,
    isError: (page1.error ?? page2.error) as Error | null,
  };
};

export default useTopHoldersConcentration;
