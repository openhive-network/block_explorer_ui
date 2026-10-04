import React, { useEffect, useMemo, useRef } from "react";
import useAccountBalances from "@/hooks/api/accountPage/useAccountBalances";
import useTopHolderRank from "@/hooks/api/common/useTopHolderRank";
import fetchingService from "@/services/FetchingService";
import { TIE_PAGE_SIZE, findRankInTieGroup } from "@/utils/topHolderLocate";
import { CoinType, BalanceType } from "@/hooks/api/common/useTopHolders";
import { getAccountBalanceRaw } from "@/utils/accountBalanceForCoin";

export type NotFoundReason = "noBalance" | "missing" | "error";

interface Props {
  account: string;
  coinType: CoinType;
  balanceType: BalanceType;
  onLocated: (rank: number) => void;
  onNotFound: (reason: NotFoundReason) => void;
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
  } = useAccountBalances(account, { inlineErrors: true });
  const balanceRaw = useMemo(
    () => getAccountBalanceRaw(accountBalancesData, coinType, balanceType),
    [accountBalancesData, coinType, balanceType]
  );
  const { rank } = useTopHolderRank(coinType, balanceType, balanceRaw);
  const done = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (done.current) return;
    if (rank !== null && rank > 0 && balanceRaw !== null) {
      done.current = true;
      // `rank` is where the account's tie group starts; find its own row in it.
      const effBalanceType = coinType === "VESTS" ? "balance" : balanceType;
      const exactTie = balanceRaw + 1 > balanceRaw;
      const locate = exactTie
        ? findRankInTieGroup(account, async (page) => {
            const res = await fetchingService.getTopHolders(
              coinType,
              effBalanceType,
              page,
              balanceRaw,
              balanceRaw + 1,
              TIE_PAGE_SIZE
            );
            return { totalPages: res.total_pages, rows: res.holders_result };
          })
        : Promise.resolve(null);
      locate
        .then((exact) => alive.current && onLocated(exact ?? rank))
        .catch(() => alive.current && onNotFound("error"));
      return;
    }
    if (accountBalancesDataLoading) return;
    if (accountBalancesDataError) {
      done.current = true;
      // A failed lookup can mean "no such account" or a network error: ask the node.
      fetchingService
        .findAccounts([account])
        .then(
          ({ accounts }) =>
            alive.current && onNotFound(accounts.length ? "error" : "missing")
        )
        .catch(() => alive.current && onNotFound("error"));
      return;
    }
    if (balanceRaw === null || balanceRaw <= 0) {
      done.current = true;
      onNotFound("noBalance");
    }
    // balance exists but rank still resolving → wait
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rank, accountBalancesDataLoading, accountBalancesDataError, balanceRaw]);

  return null;
};

export default AccountLocator;
