export type VestHpUnit = "vests" | "hp";

export interface BalanceHistorySearchParams {
  accountName?: string;
  coinType: string;
  fromBlock: Date | number | undefined;
  toBlock: Date | number | undefined;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  lastBlocks: number | undefined;
  lastTime: number | undefined;
  timeUnit: string | undefined;
  rangeSelectKey: string | undefined;
  page: number | undefined;
  filters: boolean[] | undefined;
  includeSavings: string;
}

export const defaultBalanceHistorySearchParams: BalanceHistorySearchParams = {
  accountName: undefined,
  coinType: "HIVE",
  fromBlock: undefined,
  toBlock: undefined,
  fromDate: undefined,
  toDate: undefined,
  lastBlocks: undefined,
  lastTime: 30,
  timeUnit: "days",
  rangeSelectKey: "none",
  page: undefined,
  filters: undefined,
  includeSavings: "yes",
};
