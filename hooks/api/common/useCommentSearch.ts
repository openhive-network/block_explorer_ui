import { useQuery } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";

const useCommentSearch = (
  commentSearchProps: Explorer.CommentSearchProps | undefined
) => {
  const {
    data: commentSearchData,
    isFetching: commentSearchDataLoading,
    isError: commentSearchDataError,
  } = useQuery({
    queryKey: ["commentSearch", commentSearchProps],
    queryFn: () => fetchCommentOperations(commentSearchProps),
    refetchOnWindowFocus: false,
  });

  const fetchCommentOperations = async (
    commentSearchProps: Explorer.CommentSearchProps | undefined
  ) => {
    if (!commentSearchProps) return null;
    return await fetchingService.getCommentOperation(commentSearchProps);
  };

  return {
    commentSearchData,
    commentSearchDataLoading,
    commentSearchDataError,
  };
};

export default useCommentSearch;
