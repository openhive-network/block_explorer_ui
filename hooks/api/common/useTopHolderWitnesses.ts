import { useMemo } from "react";
import useWitnesses from "@/hooks/api/common/useWitnesses";

// Set of the top-200 witness account names, from the shared useWitnesses cache.
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
            | { witness_name: string }[]
            | undefined) ?? []
        ).map((w) => w.witness_name)
      ),
    [witnessesData]
  );
  return { witnessNames, isLoading: isWitnessDataLoading };
};

export default useTopHolderWitnesses;
