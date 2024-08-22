import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useVestingDelegations = (
  delegatorAccount: string
) => {
  const {
    data: vestingDelegationsData,
    isLoading: isVestingDelegationsLoading,
    isError: isVestingDelegationsError,
  }: UseQueryResult<Hive.VestingDelegations[]> = useQuery({
    queryKey: ["vestingDelegations", delegatorAccount],
    queryFn: () =>
      fetchingService.getVestingDelegations(
        delegatorAccount
      ),
    enabled: !!delegatorAccount,
    select: (data) => {
      const sortedData = data.sort(
        (a: Hive.VestingDelegations, b: Hive.VestingDelegations) =>
          a.delegatee.toLowerCase().localeCompare(b.delegatee.toLowerCase())
      );
      return sortedData;
    },
    refetchOnWindowFocus: false,
  });

  return {
    vestingDelegationsData,
    isVestingDelegationsLoading,
    isVestingDelegationsError,
  };
};

export default useVestingDelegations;
