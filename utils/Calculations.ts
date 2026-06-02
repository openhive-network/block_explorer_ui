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
  vests: Hive.Supply | string,
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

export const convertVestsToHive = (
  hivechain: IHiveChainInterface,
  vests: Hive.Supply | string,
  totalVestingFundHive: Hive.Supply,
  totalVestingShares: Hive.Supply
) => {
  if (!hivechain || !vests || !totalVestingFundHive || !totalVestingShares)
    return;

  const convertedHive = hivechain.vestsToHp(
    vests,
    totalVestingFundHive,
    totalVestingShares
  );

  const formattedHive = hivechain.formatter.format(convertedHive);

  return formattedHive;
};

export const getVestsToHiveRatio = (
  headBlockCardData: Explorer.HeadBlockCardData | undefined
) => {
  if (!headBlockCardData) return;
  const headBlockDetails = headBlockCardData.headBlockDetails;
  const { totalVestingFundHive, totalVestingShares } = headBlockDetails;

  const result = grabNumericValue(
    formatNumber(
      grabNumericValue(totalVestingShares) /
        grabNumericValue(totalVestingFundHive),
      false,
      true
    )
  ).toFixed(3);

  const resultToString = String(result);

  return resultToString;
};

export interface VestingRatios {
  vestsPerHive: number;
  hivePerVests: number;
}

// Numeric global VESTS<->HP exchange rate (both directions) derived from the
// raw dynamic-global totals. Used for bulk per-row vesting conversions where
// calling wax once per value would be wasteful.
export const computeVestingRatios = (
  hiveChain: IHiveChainInterface | null | undefined,
  dynamicGlobalData: any
): VestingRatios | null => {
  if (!hiveChain || !dynamicGlobalData) return null;
  const { rawTotalVestingFundHive, rawTotalVestingShares } =
    dynamicGlobalData.headBlockDetails;
  const totalHive = grabNumericValue(
    hiveChain.formatter.format(rawTotalVestingFundHive)
  );
  const totalVests = grabNumericValue(
    hiveChain.formatter.format(rawTotalVestingShares)
  );
  if (!totalHive || !totalVests) return null;
  return {
    vestsPerHive: totalVests / totalHive,
    hivePerVests: totalHive / totalVests,
  };
};
