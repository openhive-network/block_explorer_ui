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
  vests: string,
  totalVestingFundHive: Hive.Supply,
  totalVestingShares: Hive.Supply
) => {
  if (!hivechain || !vests || !totalVestingFundHive || !totalVestingShares)
    return;

  const formattedVests = splitStringValue(vests.replace(/[.,]/g, ""), " VESTS");

  const convertedHp = hivechain.vestsToHp(
    formattedVests,
    totalVestingFundHive,
    totalVestingShares
    );
    //Replace original value of `HIVE` with `HP`
    const formattedHP = hivechain.formatter
    .format(convertedHp)
    .replace("HIVE", "HP");
  return formattedHP;
};

/**
 * Function converting Hive Power to USD
 *
 * @param hp Hive Power amount as number
 * @param feedPrice amount of feed_price as string, received from useGlobalDataHook() as dynamicGlobalData.headBlockDetails.totalVestingFundHive
 * @returns calculation result of USD as number
 */

export const convertHiveToUSD = (hp: number, feedPrice: string) => {
  const hivePrice = feedPrice?.split(" ")[0];
  return hp * parseFloat(hivePrice ?? "0"); //default to 0 if no matching price is found
};

export const getVestsToHiveRatio = (
  blockDetails: Hive.BlockDetails | undefined
) => {
  if (!blockDetails) return;

  const { total_vesting_fund_hive, total_vesting_shares } = blockDetails;

  const result = (total_vesting_shares / total_vesting_fund_hive).toFixed(3);

  return result;
};
