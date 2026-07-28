import { useMemo } from "react";

import usePendingAuthorRewards from "./usePendingAuthorRewards";
import usePendingCurationRewards from "./usePendingCurationRewards";
import useAccountNextPayout from "./useAccountNextPayout";
import { derivePendingRewards } from "@/utils/pendingRewards";

const usePendingRewardsSummary = (accountName: string) => {
  const {
    pendingAuthorRewards,
    isPendingAuthorRewardsLoading,
    isPendingAuthorRewardsError,
  } = usePendingAuthorRewards(accountName);
  const {
    pendingCurationRewards,
    isPendingCurationRewardsLoading,
    isPendingCurationRewardsError,
  } = usePendingCurationRewards(accountName);
  const { nextPayoutDate } = useAccountNextPayout(accountName);

  const derived = useMemo(
    () => derivePendingRewards(pendingAuthorRewards, pendingCurationRewards),
    [pendingAuthorRewards, pendingCurationRewards]
  );

  return {
    author: pendingAuthorRewards,
    curation: pendingCurationRewards,
    isAuthorLoading: isPendingAuthorRewardsLoading,
    isAuthorError: isPendingAuthorRewardsError,
    isCurationLoading: isPendingCurationRewardsLoading,
    isCurationError: isPendingCurationRewardsError,
    nextPayoutDate,
    ...derived,
  };
};

export default usePendingRewardsSummary;
