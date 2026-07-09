import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { CoinType, BalanceType } from "@/hooks/api/common/useTopHolders";

// Competition rank = 1 + accounts holding strictly more. min-balance is
// inclusive, so query balance+1 (then +1); VESTS whales past 2^53 fall back to =.
const useTopHolderRank = (
  coinType: CoinType,
  balanceType: BalanceType,
  balanceRaw: number | null
) => {
  // VESTS has no savings sub-balance; always rank by the single VESTS balance.
  const effBalanceType = coinType === "VESTS" ? "balance" : balanceType;
  const enabled = balanceRaw !== null && balanceRaw > 0;

  const strictlyAbove = balanceRaw !== null && balanceRaw + 1 > balanceRaw;
  const rankMinBalance =
    balanceRaw === null
      ? undefined
      : strictlyAbove
        ? balanceRaw + 1
        : balanceRaw;

  const { data: rankData } = useQuery<Hive.TopHoldersResponse>({
    queryKey: ["topHolderRank", coinType, effBalanceType, rankMinBalance],
    queryFn: () =>
      fetchingService.getTopHolders(
        coinType,
        effBalanceType,
        1,
        rankMinBalance
      ),
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: totalData } = useQuery<Hive.TopHoldersResponse>({
    queryKey: ["topHolderTotal", coinType, effBalanceType],
    queryFn: () => fetchingService.getTopHolders(coinType, effBalanceType, 1),
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const rawRank = rankData?.total_accounts ?? null;
  const rank = rawRank === null ? null : strictlyAbove ? rawRank + 1 : rawRank;

  return { rank, total: totalData?.total_accounts ?? null };
};

export default useTopHolderRank;
