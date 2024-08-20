/**
 * Function converting vests to hive power
 *
 * @param vests amount of VESTS as string, not trimmed, with keyword `VESTS` in it
 * @param totalVestingFundHive amount of total_vesting_fund_hive as string, received from useGlobalDataHook() as dynamicGlobalData.headBlockDetails.totalVestingFundHive
 * @param totalVestingShares amount of total_vesting_shares as string, received from useGlobalDataHook() as dynamicGlobalData.headBlockDetails.totalVestingShares
 * @returns calculation result of Hive Power (HP) as number
 */

export const convertVestsToHP = (
  vests: string,
  totalVestingFundHive: string,
  totalVestingShares: string
): number => {
  const vestsToNumber = Number(vests.replace(/,/g, "").split(" ")[0]);
  const totalVestingFundHiveToNumber = Number(
    totalVestingFundHive?.replace(/,/g, "").split(" ")[0]
  );
  const totalVestingSharesToNumber = Number(
    totalVestingShares?.replace(/,/g, "").split(" ")[0]
  );

  const result =
    vestsToNumber * (totalVestingFundHiveToNumber / totalVestingSharesToNumber);

  return result || 0;
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
