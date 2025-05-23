import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { formatPercent } from "@/lib/utils";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import fetchingService from "@/services/FetchingService";
import { formatAndDelocalizeFromTime } from "@/utils/TimeUtils";
const useWitnessDetails = (accountName: string, isWitness: boolean) => {
  const { hiveChain } = useHiveChainContext();

  const selectFunction = (witnessData: Hive.SingleWitnessResponse) => {
    const witness = {
      ...witnessData,
      votes_updated_at: witnessData.votes_updated_at,
      vests: witnessData.witness.vests? hiveChain?.vests(witnessData.witness.vests):hiveChain?.vests(0) ,
      hbd_interest_rate: formatPercent(witnessData.witness.hbd_interest_rate),
      votes_daily_change:witnessData.witness.votes_daily_change ? hiveChain?.vests(
        witnessData.witness.votes_daily_change
      ):hiveChain?.vests(0) ,
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
