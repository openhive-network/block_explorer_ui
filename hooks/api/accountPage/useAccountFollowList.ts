import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

export type FollowListType = "followers" | "following";

// The node's maximum; one batch costs about the same as a small one.
const FOLLOW_LIST_BATCH_SIZE = 1000;

const useAccountFollowList = (
  type: FollowListType,
  accountName: string,
  options?: { enabled?: boolean }
) => {
  const { enabled = true } = options || {};

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery<string[]>({
    queryKey: ["account_follow_list", type, accountName],
    queryFn: ({ pageParam = "" }) =>
      fetchingService.getAccountFollowPage(
        type,
        accountName,
        pageParam,
        FOLLOW_LIST_BATCH_SIZE
      ),
    // A later batch is one short when the node repeats the start name.
    getNextPageParam: (lastPage, pages) =>
      lastPage.length >= FOLLOW_LIST_BATCH_SIZE - (pages.length > 1 ? 1 : 0)
        ? lastPage[lastPage.length - 1]
        : undefined,
    enabled: enabled && !!accountName,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const names = useMemo(() => data?.pages.flat() ?? [], [data]);

  return {
    names,
    isLoading,
    isError,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
};

export default useAccountFollowList;
