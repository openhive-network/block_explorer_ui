import { useInfiniteQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const PAGE_SIZE = 25;
// Fetch one extra row as a "has more" sentinel so "Load more" never shows a
// phantom empty page on an exact page-size boundary.
const FETCH_COUNT = PAGE_SIZE + 1;

interface TimelineFilters {
  appFilter?: string;
  opTypeFilter?: string;
}

const useAccountRcFootprintTimeline = (
  accountName: string,
  filters: TimelineFilters,
  fromDate?: string | Date | number,
  toDate?: string | Date | number,
  enabled = true
) => {
  const { appFilter, opTypeFilter } = filters;
  const query = useInfiniteQuery<Hive.AccountRcFootprintTimelineRow[]>({
    queryKey: [
      "account_rc_footprint_timeline",
      accountName,
      appFilter,
      opTypeFilter,
      fromDate,
      toDate,
    ],
    queryFn: ({ pageParam }) =>
      fetchingService.getAccountRcFootprintTimeline(accountName, {
        appFilter,
        opTypeFilter,
        fromDate,
        toDate,
        limitCount: FETCH_COUNT,
        beforeSeq: pageParam as number | undefined,
      }),
    // Keyset cursor from the last DISPLAYED row's op_seq. More rows than
    // PAGE_SIZE means the sentinel came back → there's a next page.
    getNextPageParam: (lastPage) =>
      lastPage.length > PAGE_SIZE ? lastPage[PAGE_SIZE - 1]?.op_seq : undefined,
    enabled: enabled && !!accountName,
    refetchOnWindowFocus: false,
  });

  // Drop the per-page sentinel row from what we render.
  const rows =
    query.data?.pages.flatMap((page) => page.slice(0, PAGE_SIZE)) ?? [];

  return {
    rows,
    isLoading: query.isLoading,
    isError: query.isError,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};

export default useAccountRcFootprintTimeline;
