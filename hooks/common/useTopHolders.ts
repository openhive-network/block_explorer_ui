// hooks/common/useTopHolders.ts
import { useState, useEffect } from "react";

export type CoinType = "HIVE" | "HBD" | "VESTS";
export type BalanceType = "balance" | "savings_balance";

export interface Holder {
  rank: number;
  account: string;
  value: string;
}

interface UseTopHoldersProps {
  page: number;
  coinType: CoinType;
  balanceType: BalanceType;
}

export default function useTopHolders({ page, coinType, balanceType }: UseTopHoldersProps) {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coinType === "VESTS" && balanceType !== "balance") return;

    const fetchHolders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.syncad.com/balance-api/top-holders?coin-type=${coinType}&balance-type=${balanceType}&page=${page}`
        );
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setHolders(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHolders();
  }, [page, coinType, balanceType]);

  return { holders, loading, error };
}
