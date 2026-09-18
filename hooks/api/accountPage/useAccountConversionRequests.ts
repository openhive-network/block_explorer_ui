import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

export interface AccountConversionRequests {
  hbd: Hive.HbdConversionRequest[];
  collateralized: Hive.CollateralizedConversionRequest[];
}

const useAccountConversionRequests = (
  accountName: string,
  options?: { enabled?: boolean }
) => {
  const { enabled = true } = options || {};

  const {
    data: conversionRequests,
    isLoading: isConversionRequestsLoading,
    isError: isConversionRequestsError,
  }: UseQueryResult<AccountConversionRequests> = useQuery({
    queryKey: ["account_conversion_requests", accountName],
    queryFn: async () => {
      const [hbd, collateralized] = await Promise.all([
        fetchingService.getHbdConversionRequests(accountName),
        fetchingService.getCollateralizedConversionRequests(accountName),
      ]);
      return { hbd, collateralized };
    },
    refetchOnWindowFocus: false,
    enabled: enabled && !!accountName,
    staleTime: 30 * 1000,
    meta: { suppressErrorToast: true },
  });

  return {
    conversionRequests,
    isConversionRequestsLoading,
    isConversionRequestsError,
  };
};

export default useAccountConversionRequests;
