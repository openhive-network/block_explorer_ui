import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";

const useVestingDelegations = (
  delegatorAccount: string,
  startAccount: string | null,
  limit: number,
  liveDataEnabled: boolean
) => {
  const {
    data: vestingDelegationsData,
    isLoading: isVestingDelegationsLoading,
    isError: isVestingDelegationsError,
  }: UseQueryResult<Hive.VestingDelegations[]> = useQuery({
    queryKey: ["vestingDelegations", delegatorAccount],
    queryFn: () => fetchingService.getVestingDelegations(delegatorAccount),
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
