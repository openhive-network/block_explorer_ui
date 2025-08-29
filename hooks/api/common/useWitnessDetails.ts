import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { formatPercent } from "@/lib/utils";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import fetchingService from "@/services/FetchingService";
const useWitnessDetails = (accountName: string, isWitness: boolean) => {
  const { hiveChain } = useHiveChainContext();

  const selectFunction = (witnessData: Explorer.Witness) => {
    const witness = {
      ...witnessData,
      hbd_interest_rate: formatPercent(witnessData.witness.hbd_interest_rate),
    };
    const formattedWitness = hiveChain?.formatter.format(
      witness
    ) as Explorer.Witness;

    return formattedWitness;
  };

  const {
    data: witnessDetails,
    isLoading: isWitnessDetailsLoading,
    isError: isWitnessDetailsError,
  }: UseQueryResult<Explorer.Witness> = useQuery<any, Error, Explorer.Witness>({
    queryKey: ["witness_details", accountName],
    queryFn: () => fetchingService.getWitness(accountName),
    enabled: !!accountName && isWitness,
    select: selectFunction,
    refetchOnWindowFocus: false,
  });

  return {
    witnessDetails,
    isWitnessDetailsLoading,
    isWitnessDetailsError,
  };
};

export default useWitnessDetails;
