import { useMemo } from "react";
import useTopHolders, { CoinType } from "./useTopHolders";

const TOP_RANK_LIMIT = 20;

export type TopHolderEntry = { rank: number; coinType: CoinType };

const useAccountTopHolderRank = (accountName: string | undefined) => {
  const hive = useTopHolders("HIVE", "balance", 1);
  const hbd = useTopHolders("HBD", "balance", 1);
  const vests = useTopHolders("VESTS", "balance", 1);

  const isLoading =
    hive.isTopHoldersLoading ||
    hbd.isTopHoldersLoading ||
    vests.isTopHoldersLoading;

  const entries = useMemo<TopHolderEntry[]>(() => {
    if (!accountName) return [];
    const result: TopHolderEntry[] = [];
    const pushIfTop = (data: typeof hive.holdersData, coinType: CoinType) => {
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
  }, [accountName, hive.holdersData, hbd.holdersData, vests.holdersData]);

  return { entries, isLoading };
};

export default useAccountTopHolderRank;
