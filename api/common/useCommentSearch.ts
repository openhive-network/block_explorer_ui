import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Explorer from "@/types/Explorer";
import { useState } from "react";

const useCommentSearch = (commentSearchProps: Explorer.CommentSearchProps | undefined) => {

  const {
    data: commentSearchData,
    isFetching: commentSearchDataLoading,
    isError: commentSearchDataError,
    refetch
  } = useQuery({
    queryKey: ["commentSearch"],
    queryFn: () => fetchCommentOperations(commentSearchProps),
    refetchOnWindowFocus: false,
    enabled: !!commentSearchProps
  });

  const fetchCommentOperations = async (commentSearchProps: Explorer.CommentSearchProps | undefined) => {
    if (commentSearchProps) {
      return await fetchingService.getCommentOperation(commentSearchProps);
    } else {
      return await null;
    }
  }

  return { commentSearchData, commentSearchDataLoading, commentSearchDataError, refetch };
};

export default useCommentSearch;
