import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { formatPercent } from "@/lib/utils";
import { useHiveChainContext } from "@/contexts/HiveChainContext";

const useWitnessDetails = (accountName: string, isWitness: boolean) => {
  const { hiveChain } = useHiveChainContext();

  const selectFunction = (witnessData: Hive.Witness) => {
    const witness = {
      ...witnessData,
      vests: hiveChain?.vests(witnessData.vests),
      votes_hive_power: hiveChain?.hive(witnessData.votes_hive_power),
      hbd_interest_rate: formatPercent(witnessData.hbd_interest_rate),
      votes_daily_change: hiveChain?.vests(witnessData.votes_daily_change),
      votes_daily_change_hive_power: hiveChain?.hive(
        witnessData.votes_daily_change_hive_power
      ),
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
