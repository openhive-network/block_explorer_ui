import { useMemo } from "react";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import { config } from "@/Config";

// Set of ACTIVE witness names (top-200 by rank). Disabled witnesses (null
// signing key) are excluded so a stale registration isn't badged as active.
const useTopHolderWitnesses = () => {
  const { witnessesData, isWitnessDataLoading } = useWitnesses(
    200,
    "rank",
    "asc"
  );
  const witnessNames = useMemo(
    () =>
      new Set<string>(
        (
          (witnessesData?.witnesses as
            | { witness_name: string; signing_key: string }[]
            | undefined) ?? []
        )
          .filter((w) => w.signing_key !== config.inactiveWitnessKey)
          .map((w) => w.witness_name)
      ),
    [witnessesData]
  );
  return { witnessNames, isLoading: isWitnessDataLoading };
};

export default useTopHolderWitnesses;
