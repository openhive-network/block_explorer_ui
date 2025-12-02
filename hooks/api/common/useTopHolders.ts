import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

export type CoinType = "HIVE" | "HBD" | "VESTS";
export type BalanceType = "balance" | "savings_balance";

const useTopHolders = (coinType: CoinType, balanceType: BalanceType, page: number) => {
  const {
    data: holdersData,
    isLoading: isTopHoldersLoading,
    error: isTopHoldersError,
  } = useQuery<Hive.TopHoldersResponse>({
    queryKey: ["topHolders", coinType, balanceType, page],
    queryFn: () => fetchingService.getTopHolders(coinType, balanceType, page),
    enabled: !(coinType === "VESTS" && balanceType !== "balance"),
    refetchOnWindowFocus: false,
  });

  return {
    holdersData: holdersData?.holders_result ?? [],
    isTopHoldersLoading,
    isTopHoldersError: isTopHoldersError as Error | null,
  };
};

export default useTopHolders;
