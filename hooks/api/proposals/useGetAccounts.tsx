import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useGetAccounts = (accounts: string[]) => {
  const {
    data: accountsData,
    isFetching: isAccountsDataFetching,
    isLoading: isAccountsDataLoading,
    isError: isAccountDataError,
  } = useQuery({
    queryKey: ["getAccounts", accounts],
    queryFn: () => fetchAccounts(accounts),
    refetchOnWindowFocus: false,
  });

  const fetchAccounts = async (accounts: string[]) => {
    if (!accounts) return null;
    const response = await fetchingService.getAccounts(accounts);
    return response;
  };

  return {
    accountsData,
    isAccountsDataFetching,
    isAccountsDataLoading,
    isAccountDataError,
  };
};

export default useGetAccounts;
