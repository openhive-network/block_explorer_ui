import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

interface PostDiscussionResult {
  data: Hive.HivePosts | null | undefined;
  isError: boolean;
  isLoading: boolean;
}

const usePostDiscussion = (
  author: string,
  permlink: string,
  observer?: string
): PostDiscussionResult => {
  const trimAccount = author?.replace("@", "");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post discussion", trimAccount, permlink, observer],
    queryFn: () => fetchPostContentReplies(trimAccount, permlink, observer),
    refetchOnWindowFocus: false,
  });

  const fetchPostContentReplies = async (
    author: string,
    permlink: string,
    observer: string | undefined
  ) => {
    if (!author || !permlink) return null;

    const response = await fetchingService.getPostDiscussion(
      author,
      permlink,
      observer
    );
    return response;
  };

  return { data, isLoading, isError };
};

export default usePostDiscussion;
