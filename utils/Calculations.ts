import { splitStringValue } from "./StringUtils";
import { IHiveChainInterface } from "@hiveio/wax";
import Hive from "@/types/Hive";
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
  blockDetails: Hive.BlockDetails | undefined
) => {
  if (!blockDetails) return;
  const { total_vesting_fund_hive, total_vesting_shares } = blockDetails;

  const result = (total_vesting_shares / total_vesting_fund_hive).toFixed(3);

  return result;
};
