import { grabNumericValue, splitStringValue } from "./StringUtils";
import { IHiveChainInterface } from "@hiveio/wax";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { formatNumber } from "@/lib/utils";
import { parseDisplayOrChainDate } from "./TimeUtils";

type NaiAsset = { nai: string; amount: string; precision: number };

const NAI_SYMBOL: Record<string, string> = {
  "@@000000013": "HBD",
  "@@000000021": "HIVE",
  "@@000000037": "VESTS",
};

export const naiAssetToFloat = (asset: NaiAsset | undefined): number => {
  if (!asset) return 0;
  const value = parseFloat(asset.amount) / Math.pow(10, asset.precision);
  return isFinite(value) ? value : 0;
};

export const formatNaiAsset = (
  asset: NaiAsset | undefined,
  locale?: string
): string => {
  const precision = asset?.precision ?? 3;
  const value = naiAssetToFloat(asset);
  const symbol = asset ? (NAI_SYMBOL[asset.nai] ?? asset.nai) : "HBD";
  return `${value.toLocaleString(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })} ${symbol}`;
};
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

export interface PendingSavingsInterestInput {
  savingsHbdSeconds?: string | number | null;
  savingsHbdBalanceSatoshis?: number | null;
  lastCompoundingDate?: string | null;
  interestRateBasisPoints?: number | null;
}

// Interest that HBD savings has accrued but not yet been paid. The chain only
// credits it when a savings operation touches the account, so this is money the
// balance does not show. Delegates the arithmetic to wax's estimateHbdInterest
// so it can never drift from the chain's own pay_savings_interest.
export const calculatePendingSavingsInterest = (
  hiveChain: IHiveChainInterface | null | undefined,
  input: PendingSavingsInterestInput,
  now: Date = new Date()
): NaiAsset | null => {
  const {
    savingsHbdSeconds,
    savingsHbdBalanceSatoshis,
    lastCompoundingDate,
    interestRateBasisPoints,
  } = input;
  if (!hiveChain || !interestRateBasisPoints) return null;

  // Accepts both the raw chain shape and the display shape, so the caller is
  // free to format this field without silently breaking the maths.
  const lastUpdate = parseDisplayOrChainDate(lastCompoundingDate);
  if (!lastUpdate) return null;

  const balance = Number(savingsHbdBalanceSatoshis ?? 0);
  const seconds = String(savingsHbdSeconds ?? "0");
  if (!Number.isFinite(balance) || (!balance && seconds === "0")) return null;

  // wax asserts on a backwards interval, and the browser clock can trail the
  // chain, so never let "now" fall behind the last compounding date.
  const effectiveNow = now.getTime() > lastUpdate.getTime() ? now : lastUpdate;

  try {
    return hiveChain.estimateHbdInterest(
      seconds,
      hiveChain.hbdSatoshis(balance),
      lastUpdate,
      effectiveNow,
      interestRateBasisPoints
    );
  } catch (error) {
    // A throw here means bad inputs or a changed wax signature, not "no
    // interest" - surface it instead of hiding it behind a missing row.
    console.error("Failed to estimate pending HBD savings interest", error);
    return null;
  }
};
