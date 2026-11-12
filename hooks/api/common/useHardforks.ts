import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { EndpointUnsupportedError } from "@/utils/nodeSupport";

// Hardforks are rare, so the list is fetched once per node and kept. Errors are
// shown inline (or the dependent row is hidden), never as a toast.
const useHardforks = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["hardforks"],
    queryFn: () => fetchingService.getHardforks(),
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { suppressErrorToast: true },
  });

  return {
    hardforks: data,
    isHardforksLoading: isLoading,
    isHardforksError: isError,
    // The node has no /hardforks route, as opposed to a passing failure.
    isHardforksUnsupported:
      error instanceof EndpointUnsupportedError && !error.transient,
  };
};

export default useHardforks;
