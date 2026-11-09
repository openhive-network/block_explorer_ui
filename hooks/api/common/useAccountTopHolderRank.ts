import { useMemo } from "react";
import useTopHolders, {
  CoinType,
  DEFAULT_BALANCE_TYPE,
  useEffectiveBalanceType,
} from "./useTopHolders";
import { deploySettings } from "@/utils/deploySettings";

// One page is fetched and the API returns 100 per page, so 100 is the ceiling.
const TOP_RANK_LIMIT = 100;

export type TopHolderEntry = { rank: number; coinType: CoinType };

const useAccountTopHolderRank = (accountName: string | undefined) => {
  const topHoldersEnabled = deploySettings.topHolders;
  // Same ranking as /top-holders, which the badge links to (HIVE and HBD
  // resolve alike: both depend only on the node).
  const liquidOrTotal = useEffectiveBalanceType("HIVE", DEFAULT_BALANCE_TYPE);
  const hive = useTopHolders(
    "HIVE",
    liquidOrTotal.balanceType,
    1,
    undefined,
    undefined,
    topHoldersEnabled && liquidOrTotal.ready
  );
  const hbd = useTopHolders(
    "HBD",
    liquidOrTotal.balanceType,
    1,
    undefined,
    undefined,
    topHoldersEnabled && liquidOrTotal.ready
  );
  const vests = useTopHolders(
    "VESTS",
    "balance",
    1,
    undefined,
    undefined,
    topHoldersEnabled
  );

  const isLoading =
    hive.isTopHoldersLoading ||
    hbd.isTopHoldersLoading ||
    vests.isTopHoldersLoading;

  const entries = useMemo<TopHolderEntry[]>(() => {
    if (!accountName || !topHoldersEnabled) return [];
    const result: TopHolderEntry[] = [];
    const pushIfTop = (
      data: ReturnType<typeof useTopHolders>["holdersData"],
      coinType: CoinType
    ) => {
      const found = data.find((h) => h.account === accountName);
      if (found && found.rank > 0 && found.rank <= TOP_RANK_LIMIT) {
        result.push({ rank: found.rank, coinType });
      }
    };
    pushIfTop(hive.holdersData, "HIVE");
    pushIfTop(hbd.holdersData, "HBD");
    pushIfTop(vests.holdersData, "VESTS");
    result.sort((a, b) => a.rank - b.rank);
    return result;
  }, [
    accountName,
    topHoldersEnabled,
    hive.holdersData,
    hbd.holdersData,
    vests.holdersData,
  ]);

  return { entries, isLoading };
};

export default useAccountTopHolderRank;
