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
    refetch: refetchBlockSearchData,
  } = useQuery({
    queryKey: ["blockSearch", allBlockSearchProps, page, liveDataEnabled],
    queryFn: () => fetchAllBlocks(allBlockSearchProps, page, toBlock),
    refetchOnWindowFocus: false,
    refetchInterval: liveDataEnabled ? config.mainRefreshInterval : false,
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
    refetchBlockSearchData,
  };
};

export default useAllBlocksSearch;
