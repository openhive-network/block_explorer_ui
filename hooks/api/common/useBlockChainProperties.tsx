import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

const useBlockChainProperties = () => {
  const {
    data: blockChainPropertiesData,
    isLoading: blockChainPropertiesDataLoading,
    isError: blockChainPropertiesDataError,
  } = useQuery({
    queryKey: ["blockChainPropertiesData"],
    queryFn: () => fetchingService.getBlockChainProps(),
    refetchOnWindowFocus: false,
  });

  return { blockChainPropertiesData, blockChainPropertiesDataLoading, blockChainPropertiesDataError };
};

export default useBlockChainProperties;
