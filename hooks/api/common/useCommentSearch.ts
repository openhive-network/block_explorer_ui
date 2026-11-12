import { useQuery } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";
import { keepPreviousDataFor } from "@/hooks/common/keepPreviousDataFor";

const useCommentSearch = (
  commentSearchProps: Explorer.CommentSearchProps | undefined
) => {
  const {
    data: commentSearchData,
    isFetching: isCommentSearchDataFetching,
    isError: commentSearchDataError,
    isPlaceholderData: commentSearchShowingPrevious,
    refetch: refetchCommentSearchData,
  } = useQuery({
    queryKey: ["commentSearch", commentSearchProps],
    queryFn: () => fetchCommentOperations(commentSearchProps),
    // Same author and permlink only: these are one post's interactions.
    placeholderData: keepPreviousDataFor((previousKey) => {
      const previous = previousKey[1] as
        | Explorer.CommentSearchProps
        | undefined;
      return (
        previous?.accountName === commentSearchProps?.accountName &&
        previous?.permlink === commentSearchProps?.permlink
      );
    }),
    refetchOnWindowFocus: false,
    enabled:
      !!commentSearchProps?.permlink && !!commentSearchProps?.accountName,
    meta: { showErrorToast: true },
  });

  const fetchCommentOperations = async (
    commentSearchProps: Explorer.CommentSearchProps | undefined
  ) => {
    if (!commentSearchProps) return null;
    return await fetchingService.getCommentOperation(commentSearchProps);
  };

  return {
    commentSearchData,
    isCommentSearchDataFetching,
    commentSearchDataError,
    commentSearchShowingPrevious,
    refetchCommentSearchData,
  };
};

export default useCommentSearch;
