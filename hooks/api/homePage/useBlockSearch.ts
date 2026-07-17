import { useQuery } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";

const useBlockSearch = (blockSearchProps?: Explorer.BlockSearchProps) => {
  const {
    data: blockSearchData,
    isFetching: blockSearchDataLoading,
    isError: blockSearchDataError,
  } = useQuery({
    queryKey: ["blockSearch", blockSearchProps],
    queryFn: () => fetchBlocksNumbers(blockSearchProps),
    refetchOnWindowFocus: false,
    // User-initiated search: surface errors via toast even on the home route,
    // where background widget errors are otherwise suppressed.
    meta: { showErrorToast: true },
  });

  const fetchBlocksNumbers = async (
    blockSearchProps: Explorer.BlockSearchProps | undefined
  ) => {
    if (!blockSearchProps) return null;
    const response = await fetchingService.getBlockByOp(blockSearchProps);
    return response;
  };

  return { blockSearchData, blockSearchDataLoading, blockSearchDataError };
};

export default useBlockSearch;
