import { grabNumericValue, splitStringValue } from "./StringUtils";
import { IHiveChainInterface } from "@hiveio/wax";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { formatNumber } from "@/lib/utils";
/**
 * Function converting vests to hive power
 * @param  hivechain response from HiveChainContext.ts as type IHiveChainInterface | undefined,
 * @param vests amount of VESTS as string, not trimmed, with keyword `VESTS` in it
 * @param totalVestingFundHive amount of total_vesting_fund_hive as string, received from useGlobalDataHook() as dynamicGlobalData.headBlockDetails.totalVestingFundHive
 * @param totalVestingShares amount of total_vesting_shares as string, received from useGlobalDataHook() as dynamicGlobalData.headBlockDetails.totalVestingShares
 * @returns calculation result of Hive Power (HP) as number
 */

export const convertVestsToHP = (
  hivechain: IHiveChainInterface,
  vests: Hive.Supply,
  totalVestingFundHive: Hive.Supply,
  totalVestingShares: Hive.Supply
) => {
  if (!hivechain || !vests || !totalVestingFundHive || !totalVestingShares)
    return;

  const convertedHp = hivechain.vestsToHp(
    vests,
    totalVestingFundHive,
    totalVestingShares
    );
    //Replace original value of `HIVE` with `HP`
    const formattedHP = hivechain.formatter
    .format(convertedHp)
    .replace("HIVE", "HP");
  return formattedHP;
};

export const getVestsToHiveRatio = (
  headBlockCardData: Explorer.HeadBlockCardData | undefined
) => {
  if (!headBlockCardData) return;
  const headBlockDetails = headBlockCardData.headBlockDetails;
  const { totalVestingFundHive, totalVestingShares } = headBlockDetails;
  const result = formatNumber( (grabNumericValue(totalVestingShares) / grabNumericValue(totalVestingFundHive)),false,true);

  return result;
};
