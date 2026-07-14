import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

export type CoinType = "HIVE" | "HBD" | "VESTS";
export type BalanceType = "balance" | "savings_balance";

const useTopHolders = (
  coinType: CoinType,
  balanceType: BalanceType,
  page: number,
  minBalance?: number,
  maxBalance?: number
) => {
  const {
    data: holdersData,
    isLoading: isTopHoldersLoading,
    error: isTopHoldersError,
  } = useQuery<Hive.TopHoldersResponse>({
    queryKey: [
      "topHolders",
      coinType,
      balanceType,
      page,
      minBalance,
      maxBalance,
    ],
    queryFn: () =>
      fetchingService.getTopHolders(
        coinType,
        balanceType,
        page,
        minBalance,
        maxBalance
      ),
    enabled: !(coinType === "VESTS" && balanceType !== "balance"),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    holdersData: holdersData?.holders_result ?? [],
    totalAccounts: holdersData?.total_accounts ?? 0,
    totalPages: holdersData?.total_pages ?? 0,
    isTopHoldersLoading,
    isTopHoldersError: isTopHoldersError as Error | null,
  };
};

export default useTopHolders;
