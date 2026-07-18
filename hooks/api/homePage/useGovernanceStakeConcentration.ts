import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useGovernanceStakeConcentration = () => {
  const {
    data: concentration,
    isLoading: isConcentrationLoading,
    isError: isConcentrationError,
  }: UseQueryResult<
    Hive.GovernanceInfluenceConcentrationResponse[] | undefined
  > = useQuery({
    queryKey: ["governanceStakeConcentration"],
    queryFn: () => fetchingService.getGovernanceInfluenceConcentration(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { concentration, isConcentrationLoading, isConcentrationError };
};

export default useGovernanceStakeConcentration;
