import { useMemo } from "react";
import { config } from "@/Config";
import useWitnesses from "@/hooks/api/common/useWitnesses";

export interface WatchedWitnessHealth {
  name: string;
  isActive: boolean;
  rank: number;
  missedBlocks: number;
  version: string;
  feedUpdatedAt: Date | null;
  priceFeed: number;
  isLoading: boolean;
}

/**
 * Health snapshot for a fixed set of witnesses (e.g. the user's votes).
 * Reuses the bulk `useWitnesses(1000)` cache to avoid N per-witness calls.
 */
const useWatchedWitnesses = (
  names: string[]
): { witnesses: WatchedWitnessHealth[]; isLoading: boolean } => {
  const enabled = names.length > 0;
  const { witnessesData, isWitnessDataLoading } = useWitnesses(
    1000,
    "rank",
    "asc",
    enabled
  );

  const byName = useMemo(() => {
    const map = new Map<string, any>();
    if (witnessesData?.witnesses) {
      for (const w of witnessesData.witnesses as any[]) {
        map.set(w.witness_name, w);
      }
    }
    return map;
  }, [witnessesData]);

  const witnesses: WatchedWitnessHealth[] = useMemo(
    () =>
      names.map((name) => {
        const data = byName.get(name);
        return {
          name,
          isActive: !!data && data.signing_key !== config.inactiveWitnessKey,
          rank: data?.rank ?? 0,
          missedBlocks: data?.missed_blocks ?? 0,
          version: data?.version ?? "",
          feedUpdatedAt: data?.feed_updated_at
            ? new Date(data.feed_updated_at)
            : null,
          priceFeed: data?.price_feed ?? 0,
          isLoading: isWitnessDataLoading,
        };
      }),
    [names, byName, isWitnessDataLoading]
  );

  return {
    witnesses,
    isLoading: enabled && isWitnessDataLoading,
  };
};

export default useWatchedWitnesses;
