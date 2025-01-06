import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const usePostContentReplies = (
  accountName: string,
  permlink: string,
  ...queryProps: any
) => {
  const trimAccount = accountName.replace("@", "");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post content replies", trimAccount, permlink],
    queryFn: () => fetchPostContentReplies(trimAccount, permlink),
    refetchOnWindowFocus: false,
    ...queryProps,
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

  return { data, isLoading, isError } as {
    data: Hive.Content[];
    isLoading: boolean;
    isError: boolean;
  };
};

export default usePostContentReplies;
