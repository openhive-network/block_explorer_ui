import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { formatPercent } from "@/lib/utils";

const useWitnessDetails = (accountName: string, isWitness: boolean) => {

  const selectFunction = (witnessData: Hive.Witness) => {
    const witness: Explorer.Witness = {...witnessData, 
      vests: witnessData.vests.toLocaleString(),
      votes_hive_power: witnessData.votes_hive_power.toLocaleString(),
      hbd_interest_rate: formatPercent(witnessData.hbd_interest_rate),
      votes_daily_change: witnessData.votes_daily_change.toLocaleString(),
      votes_daily_change_hive_power: witnessData.votes_daily_change_hive_power.toLocaleString()
    }
    return witness;
  }

  const {
    data: witnessDetails,
    isLoading: isWitnessDetailsLoading,
    isError: isWitnessDetailsError,
  }: UseQueryResult<Explorer.Witness> = useQuery({
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
