import { useQuery } from "@tanstack/react-query";

import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";
import { ContentFeed, collectReblogs } from "./reblogWalk";

export type ContentFeedKind = "posts" | "comments" | "reblogs";

// Reblogs have no sort of their own: they arrive inside "blog", tagged.
const SORT: Record<ContentFeedKind, "posts" | "comments" | "blog"> = {
  posts: "posts",
  comments: "comments",
  reblogs: "blog",
};

const useAccountContentFeed = (
  accountName: string | undefined,
  kind: ContentFeedKind,
  liveDataEnabled: boolean,
  limit: number = 20
) => {
  const { data, isLoading, isError } = useQuery<ContentFeed>({
    queryKey: [
      "account_content_feed",
      accountName,
      kind,
      limit,
      liveDataEnabled,
    ],
    queryFn: async () => {
      if (kind !== "reblogs") {
        const items =
          (await fetchingService.getAccountPosts(
            accountName!,
            limit,
            SORT[kind]
          )) ?? [];
        return { entries: items, truncated: false, scanned: items.length };
      }
      return collectReblogs(
        async (cursor) =>
          (await fetchingService.getAccountPosts(
            accountName!,
            config.bridgePageMax,
            "blog",
            cursor
          )) ?? [],
        limit
      );
    },
    refetchInterval: liveDataEnabled ? config.contentRefreshInterval : false,
    refetchOnWindowFocus: false,
    enabled: !!accountName,
  });

  return {
    entries: data?.entries,
    truncated: !!data?.truncated,
    scannedEntries: data?.scanned ?? 0,
    isLoading,
    isError,
  };
};

export default useAccountContentFeed;
