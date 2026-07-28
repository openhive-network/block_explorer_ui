import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountDappFootprint = (
  accountName: string,
  fromDate?: string | Date | number,
  toDate?: string | Date | number,
  enabled = true
) => {
  const {
    data: dappFootprint,
    isLoading: isDappFootprintLoading,
    isError: isDappFootprintError,
  }: UseQueryResult<Hive.AccountDappFootprintResponse | undefined> = useQuery({
    queryKey: ["account_dapp_footprint", accountName, fromDate, toDate],
    queryFn: () =>
      fetchingService.getAccountDappFootprint(accountName, fromDate, toDate),
    enabled: enabled && !!accountName,
    keepPreviousData: true,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    dappFootprint,
    isDappFootprintLoading,
    isDappFootprintError,
  };
};

export default useAccountDappFootprint;
