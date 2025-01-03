import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const usePostContentReplies = (accountName: string, permlink: string) => {
  const trimAccount = accountName.replace("@", "");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post content replies", trimAccount, permlink],
    queryFn: () => fetchPostContentReplies(trimAccount, permlink),
    refetchOnWindowFocus: false,
  });

  const fetchPostContentReplies = async (
    accountName: string,
    permlink: string
  ) => {
    if (!accountName || !permlink) return null;

    const response = await fetchingService.getContentReplies(
      accountName,
      permlink
    );
    return response;
  };

  return { data, isLoading, isError };
};

export default usePostContentReplies;
