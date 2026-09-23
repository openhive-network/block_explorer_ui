import { useQuery } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";

const useAllBlocksSearch = (
  allBlockSearchProps?: Explorer.AllBlocksSearchProps,
  page?: number,
  toBlock?: number,
  liveDataEnabled?: boolean
) => {
  const {
    data: blocksSearchData,
    isFetching: blocksSearchDataLoading,
    isError: blocksSearchDataError,
    isPreviousData: blocksSearchShowingPrevious,
    refetch: refetchBlockSearchData,
  } = useQuery({
    queryKey: ["blockSearch", allBlockSearchProps, page, liveDataEnabled],
    queryFn: () => fetchAllBlocks(allBlockSearchProps, page, toBlock),
    refetchOnWindowFocus: false,
    refetchInterval: liveDataEnabled ? config.mainRefreshInterval : false,
    // Paging keeps the current rows on screen instead of blanking to a spinner.
    // This search runs on a longer timeout than the rest of the app, so the
    // wait it covers can be seconds long.
    keepPreviousData: true,
    // A call that outlives config.blockSearchTimeout is not a blip worth
    // doubling the wait for; surface it instead of retrying.
    retry: false,
    // User-initiated search: surface errors via toast even on the home route.
    meta: { showErrorToast: true },
  });
  const fetchAllBlocks = async (
    allBlockSearchProps: Explorer.AllBlocksSearchProps | undefined,
    page: number | undefined,
    toBlock: number | undefined
  ) => {
    const response = await fetchingService.getAllBlocksByOp(
      allBlockSearchProps,
      page,
      toBlock
    );
    return response;
  };

  return {
    blocksSearchData,
    blocksSearchDataLoading,
    blocksSearchDataError,
    blocksSearchShowingPrevious,
    refetchBlockSearchData,
  };
};

export default useAllBlocksSearch;
