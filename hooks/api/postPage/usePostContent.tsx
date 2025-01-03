import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const usePostContent = (accountName: string, permlink: string) => {
  const trimAccount = accountName.replace("@", "");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post content", trimAccount, permlink],
    queryFn: () => fetchPostContent(trimAccount, permlink),
    refetchOnWindowFocus: false,
  });

  const fetchPostContent = async (accountName: string, permlink: string) => {
    if (!accountName || !permlink) return null;

    const response = await fetchingService.getContent(accountName, permlink);
    return response;
  };

  return { data, isLoading, isError };
};

export default usePostContent;
