import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

// The DApp registry is static between deploys and only ~dozens of rows — cache
// it hard and reuse across the card and report.
const useCustomJsonAppRegistry = (enabled = true) => {
  const {
    data: appRegistry,
    isLoading: isAppRegistryLoading,
    isError: isAppRegistryError,
  }: UseQueryResult<Hive.CustomJsonAppRegistryRow[] | undefined> = useQuery({
    queryKey: ["customJsonAppRegistry"],
    queryFn: () => fetchingService.getCustomJsonAppRegistry(),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { appRegistry, isAppRegistryLoading, isAppRegistryError };
};

export default useCustomJsonAppRegistry;
