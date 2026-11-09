import { keepPreviousData, useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { getHttpStatus } from "@/utils/nodeSupport";

export type CoinType = "HIVE" | "HBD" | "VESTS";
// "total" ranks by liquid + savings.
export type BalanceType = "balance" | "savings_balance" | "total";

export const DEFAULT_BALANCE_TYPE: BalanceType = "total";

// Above any real HBD total, so the check returns no rows and stays cheap.
const PROBE_MIN_BALANCE = 1e15;

// The node rejecting the option is a 400 (bad enum value). Anything else,
// including 408/429, may be a blip and must not stick for the session.
export const isOptionRejected = (err: unknown): boolean =>
  getHttpStatus(err) === 400;

// balance-type=total needs balance_tracker!414; older nodes answer HTTP 400
// ("invalid input value for enum"). Asked once per node: the query client is
// rebuilt when the node changes. undefined while the answer is pending.
export const useTotalRankingSupported = (): boolean | undefined => {
  const { data, isError } = useQuery({
    queryKey: ["topHoldersTotalSupported"],
    queryFn: () =>
      fetchingService
        .getTopHolders("HBD", "total", 1, PROBE_MIN_BALANCE, undefined, 1)
        .then(
          () => true,
          (err) => {
            if (isOptionRejected(err)) return false;
            throw err;
          }
        ),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    meta: { suppressErrorToast: true },
  });
  // After a failed check, rank by liquid rather than show nothing; the check
  // runs again when a component using it next mounts.
  return isError ? false : data;
};

// The balance type to actually request: VESTS has no savings, and nodes without
// the total ranking fall back to liquid. `ready` is false while that is unknown,
// so callers don't fetch a ranking they would throw away.
export const resolveBalanceType = (
  coinType: CoinType,
  requested: BalanceType,
  totalSupported: boolean | undefined
): { balanceType: BalanceType; ready: boolean } => {
  if (coinType === "VESTS") return { balanceType: "balance", ready: true };
  if (requested !== "total") return { balanceType: requested, ready: true };
  return {
    balanceType: totalSupported === false ? "balance" : "total",
    ready: totalSupported !== undefined,
  };
};

export const useEffectiveBalanceType = (
  coinType: CoinType,
  requested: BalanceType
) => {
  const supported = useTotalRankingSupported();
  return {
    ...resolveBalanceType(coinType, requested, supported),
    // What the default request resolves to here, for "is this a filter?" checks.
    defaultBalanceType: resolveBalanceType(
      coinType,
      DEFAULT_BALANCE_TYPE,
      supported
    ).balanceType,
    totalSupported: supported === true,
  };
};

const useTopHolders = (
  coinType: CoinType,
  balanceType: BalanceType,
  page: number,
  minBalance?: number,
  maxBalance?: number,
  enabled: boolean = true
) => {
  const {
    data: holdersData,
    isPending: isTopHoldersLoading,
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
    enabled: enabled && !(coinType === "VESTS" && balanceType !== "balance"),
    placeholderData: keepPreviousData,
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
