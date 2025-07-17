import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountFollowing = (
    accountName: string,
    options?: { enabled?: boolean }
) => {
    const { enabled = true } = options || {};
    const {
        data: accountFollowing,
        isLoading: isAccountFollowingLoading,
        isError: isAccountFollowingError,
    }: UseQueryResult<Hive.AccountFollowing[]> = useQuery({
        queryKey: ["account_following", accountName],
        queryFn: () => fetchingService.getAccountFollowing(accountName),
        refetchOnWindowFocus: false,
        enabled: enabled,
        staleTime: 5 * 60 * 1000,
        keepPreviousData:true,
    });

    return {
        accountFollowing,
        isAccountFollowingLoading,
        isAccountFollowingError,
    };
};

export default useAccountFollowing;
