import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useCommunity = (communityName: string | null | undefined) => {
  const {
    data: communityDetails,
    isLoading: isCommunityDetailsLoading,
    isError: isCommunityDetailsError,
  } = useQuery<Hive.CommunityDetails, Error>({
    queryKey: ["community", communityName],
    queryFn: async () => {
      return fetchingService.getCommunityDetails(communityName!);
    },
    enabled: !!communityName,
    refetchOnWindowFocus: false,
  });

  return { communityDetails, isCommunityDetailsLoading, isCommunityDetailsError };
};

export default useCommunity;