import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useWitnessDetails = (accountName: string, isWitness: boolean) => {
  const {
    data: witnessDetails,
    isLoading: isWitnessDetailsLoading,
    isError: isWitnessDetailsError,
  }: UseQueryResult<Hive.Witness> = useQuery({
    queryKey: ["witness_details", accountName],
    queryFn: () => fetchingService.getWitness(accountName),
    enabled: !!accountName && isWitness,
    refetchOnWindowFocus: false,
  });

  return {
    witnessDetails,
    isWitnessDetailsLoading,
    isWitnessDetailsError,
  };
};

export default useWitnessDetails;
