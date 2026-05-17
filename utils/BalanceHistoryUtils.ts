export interface BalanceHistoryOperation {
  timestamp: number;
  balance: number;
  savings_balance?: number;
  hivePrice: string;
}

export interface PreparedBalanceHistoryEntry {
  timestamp: string;
  balance: number;
  balance_change: number;
  savings_balance: number | undefined;
  savings_balance_change: number | undefined;
  hivePrice: string;
}

export const compactFormat = (v: number, decimals = 2): string => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(decimals)}K`;
  return v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
};

export const fullFormat = (v: number, decimals: number): string =>
  v.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const prepareBalanceHistoryData = (
  operations: BalanceHistoryOperation[]
): PreparedBalanceHistoryEntry[] => {
  if (!operations || operations.length === 0) return [];

  const aggregatedData = new Map<
    string,
    {
      balance: number;
      balance_change: number;
      savings_balance: number | undefined;
      savings_balance_change: number | undefined;
      hivePrice: string;
    }
  >();

  operations.forEach((operation: any) => {
    const balance_change =
      operation.balance.balance - operation.prev_balance.balance;
    const balance = parseInt(operation.balance.balance, 10);
    const savings_balance = operation.balance.savings_balance
      ? parseInt(operation.balance.savings_balance, 10)
      : undefined;
    const savings_balance_change =
      operation.balance.savings_balance -
      operation.prev_balance.savings_balance;
    const hivePrice = operation.hivePrice;

    aggregatedData.set(operation.date, {
      balance,
      balance_change,
      savings_balance,
      savings_balance_change,
      hivePrice,
    });
  });

  return Array.from(aggregatedData.entries()).map(([date, data]) => ({
    timestamp: date,
    balance: data.balance,
    balance_change: data.balance_change,
    savings_balance: data.savings_balance,
    savings_balance_change: data.savings_balance_change,
    hivePrice: data.hivePrice,
  }));
};
