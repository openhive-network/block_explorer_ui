import { useQuery } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";

const usePermlinkSearch = (
  permlinkSearchProps: Explorer.PermlinkSearchProps | undefined
) => {
  const {
    data: permlinkSearchData,
    isFetching: permlinkSearchDataLoading,
    isError: permlinkSearchDataError,
  } = useQuery({
    queryKey: ["permlinkSearch", permlinkSearchProps],
    queryFn: () => fetchCommentOperations(permlinkSearchProps),
    refetchOnWindowFocus: false,
  });

  const fetchCommentOperations = async (
    permlinkSearchProps: Explorer.PermlinkSearchProps | undefined
  ) => {
    if (!permlinkSearchProps) return null;
    return await fetchingService.getAccountPermlinks(permlinkSearchProps);
  };

  return {
    permlinkSearchData,
    permlinkSearchDataLoading,
    permlinkSearchDataError,
  };
};

export default usePermlinkSearch;
