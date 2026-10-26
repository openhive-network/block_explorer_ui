import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

export type RcGroupBy = "op_type" | "app";

const useAccountRcFootprint = (
  accountName: string,
  fromDate: string | Date | number | undefined,
  toDate: string | Date | number | undefined,
  groupBy: RcGroupBy,
  enabled = true
) => {
  const {
    data: rcFootprint,
    isLoading,
    isPreviousData,
    isError: isRcFootprintError,
  }: UseQueryResult<Hive.AccountRcFootprintRow[] | undefined> = useQuery({
    queryKey: ["account_rc_footprint", accountName, fromDate, toDate, groupBy],
    queryFn: () =>
      fetchingService.getAccountRcFootprint(
        accountName,
        fromDate,
        toDate,
        groupBy
      ),
    enabled: enabled && !!accountName,
    keepPreviousData: true,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Data kept from the previous range counts as loading, so a report never
  // shows the old numbers under the newly selected range.
  const isRcFootprintLoading = isLoading || isPreviousData;

  return { rcFootprint, isRcFootprintLoading, isRcFootprintError };
};

export default useAccountRcFootprint;
