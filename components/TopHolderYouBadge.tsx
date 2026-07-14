import React, { useMemo } from "react";
import { Crosshair } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/contexts/AuthContext";
import useAccountBalances from "@/hooks/api/accountPage/useAccountBalances";
import useTopHolderRank from "@/hooks/api/common/useTopHolderRank";
import { CoinType, BalanceType } from "@/hooks/api/common/useTopHolders";
import { getAccountBalanceRaw } from "@/utils/accountBalanceForCoin";

interface Props {
  coinType: CoinType;
  balanceType: BalanceType;
  onJump: (rank: number) => void;
}

const TopHolderYouBadge: React.FC<Props> = ({
  coinType,
  balanceType,
  onJump,
}) => {
  const { t, locale } = useI18n();
  const { username } = useAuth();
  const { accountBalancesData } = useAccountBalances(username ?? "");

  const balanceRaw = useMemo(
    () => getAccountBalanceRaw(accountBalancesData, coinType, balanceType),
    [accountBalancesData, coinType, balanceType]
  );

  const { rank, total } = useTopHolderRank(coinType, balanceType, balanceRaw);

  if (!username || rank === null || total === null || rank <= 0 || total <= 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => onJump(rank)}
      title={t("topHolders.youRankTooltip")}
      data-testid="top-holders-you-badge"
      className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-200 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300 dark:hover:bg-violet-900"
    >
      <Crosshair className="h-3.5 w-3.5" />
      {t("topHolders.youRank", {
        rank: rank.toLocaleString(locale),
        total: total.toLocaleString(locale),
      })}
    </button>
  );
};

export default TopHolderYouBadge;
