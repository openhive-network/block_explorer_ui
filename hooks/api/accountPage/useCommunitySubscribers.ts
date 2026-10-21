import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type Hive from "@/types/Hive";

const SUBSCRIBERS_PAGE_LIMIT = config.standardPaginationSize;

// Each entry arrives as [name, role, title, subscribed at].
export const toCommunitySubscribers = (
  rawResult: unknown
): Hive.CommunitySubscriber[] =>
  Array.isArray(rawResult)
    ? rawResult.map((subscriberTuple: any[]) => ({
        name: subscriberTuple[0],
        role: subscriberTuple[1],
        title: subscriberTuple[2],
        created_at: subscriberTuple[3],
      }))
    : [];

// The list is alphabetical; `startAfter` begins it right after that subscriber.
const useCommunitySubscribers = (
  communityName: string,
  startAfter?: string
) => {
  const {
    data,
    isLoading: isCommunitySubscribersLoading,
    isError: isCommunitySubscribersError,
    isFetching: isCommunitySubscribersFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<Hive.CommunitySubscriber[]>({
    queryKey: ["communitySubscribers", communityName, startAfter],
    queryFn: async ({ pageParam = startAfter }) => {
      return toCommunitySubscribers(
        await fetchingService.getCommunitySubscribers(
          communityName,
          pageParam,
          SUBSCRIBERS_PAGE_LIMIT
        )
      );
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < SUBSCRIBERS_PAGE_LIMIT) {
        return undefined;
      }
      return lastPage[lastPage.length - 1]?.name;
    },
    enabled: !!communityName,
    refetchOnWindowFocus: false,
  });

  const subscribersData = data?.pages.flatMap((page) => page) || [];

  return {
    subscribersData,
    isCommunitySubscribersLoading,
    isCommunitySubscribersError,
    isCommunitySubscribersFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};

// Answers "is this account subscribed, and in what role?" in one request. The
// node rejects a name that is malformed or not an account.
export const useCommunitySubscriberLookup = (
  communityName: string,
  accountName: string
) => {
  const {
    data,
    isFetching: isLookupLoading,
    isError: isLookupError,
  } = useQuery<{ subscribed: boolean; role?: string; title?: string }>({
    queryKey: ["communitySubscriberLookup", communityName, accountName],
    queryFn: async () => {
      try {
        const context = await fetchingService.getCommunityContext(
          communityName,
          accountName
        );
        return {
          subscribed: !!context?.subscribed,
          role: context?.role,
          title: context?.title,
        };
      } catch (error: any) {
        const text = `${error?.message ?? ""} ${JSON.stringify(error ?? {})}`;
        if (/does not exist|invalid account/i.test(text))
          return { subscribed: false };
        throw error;
      }
    },
    enabled: !!communityName && !!accountName,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    isSubscribed: data?.subscribed,
    lookupRole: data?.role,
    lookupTitle: data?.title,
    isLookupLoading,
    isLookupError,
  };
};

export default useCommunitySubscribers;
