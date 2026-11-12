import { useQuery } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";
import { keepPreviousDataFor } from "@/hooks/common/keepPreviousDataFor";

const usePermlinkSearch = (
  permlinkSearchProps: Explorer.PermlinkSearchProps | undefined
) => {
  const {
    data: permlinkSearchData,
    isFetching: permlinkSearchDataLoading,
    isError: permlinkSearchDataError,
    isPlaceholderData: permlinkSearchShowingPrevious,
    refetch: permlinkSearchRefetchData,
  } = useQuery({
    queryKey: ["permlinkSearch", permlinkSearchProps],
    queryFn: () => fetchCommentPermlinks(permlinkSearchProps),
    placeholderData: keepPreviousDataFor(
      (previousKey) =>
        (previousKey[1] as Explorer.PermlinkSearchProps | undefined)
          ?.accountName === permlinkSearchProps?.accountName
    ),
    refetchOnWindowFocus: false,
    enabled: !!permlinkSearchProps?.accountName,
    meta: { showErrorToast: true },
  });

  const fetchCommentPermlinks = async (
    permlinkSearchProps: Explorer.PermlinkSearchProps | undefined
  ) => {
    if (!permlinkSearchProps) return null;
    return await fetchingService.getCommentPermlinks(permlinkSearchProps);
  };

  return {
    permlinkSearchData,
    permlinkSearchDataLoading,
    permlinkSearchDataError,
    permlinkSearchShowingPrevious,
    permlinkSearchRefetchData,
  };
};

export default usePermlinkSearch;
