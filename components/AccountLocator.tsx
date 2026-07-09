import React, { useEffect, useMemo, useRef } from "react";
import useAccountBalances from "@/hooks/api/accountPage/useAccountBalances";
import useTopHolderRank from "@/hooks/api/common/useTopHolderRank";
import { CoinType, BalanceType } from "@/hooks/api/common/useTopHolders";
import { getAccountBalanceRaw } from "@/utils/accountBalanceForCoin";

interface Props {
  account: string;
  coinType: CoinType;
  balanceType: BalanceType;
  onLocated: (rank: number) => void;
  onNotFound: () => void;
}

// Headless: fires onLocated(rank) once, or onNotFound; remount (via key) to re-run.
const AccountLocator: React.FC<Props> = ({
  account,
  coinType,
  balanceType,
  onLocated,
  onNotFound,
}) => {
  const {
    accountBalancesData,
    accountBalancesDataLoading,
    accountBalancesDataError,
  } = useAccountBalances(account);
  const balanceRaw = useMemo(
    () => getAccountBalanceRaw(accountBalancesData, coinType, balanceType),
    [accountBalancesData, coinType, balanceType]
  );
  const { rank } = useTopHolderRank(coinType, balanceType, balanceRaw);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (rank !== null && rank > 0) {
      done.current = true;
      onLocated(rank);
      return;
    }
    if (accountBalancesDataLoading) return;
    if (accountBalancesDataError || balanceRaw === null || balanceRaw <= 0) {
      done.current = true;
      onNotFound();
    }
    // balance exists but rank still resolving → wait
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rank, accountBalancesDataLoading, accountBalancesDataError, balanceRaw]);

  return null;
};

export default AccountLocator;
