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
    isLoading,
    isPreviousData,
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

  // Data kept from the previous range counts as loading, so a report never
  // shows the old numbers under the newly selected range.
  const isDappFootprintLoading = isLoading || isPreviousData;

  return {
    dappFootprint,
    isDappFootprintLoading,
    isDappFootprintError,
  };
};

export default useAccountDappFootprint;
