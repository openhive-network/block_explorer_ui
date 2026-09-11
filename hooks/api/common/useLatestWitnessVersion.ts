import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

// Highest witness version on the chain, used to badge rows as up to date.
// Sorting server-side and taking one row scans every witness for the cost of a
// single small response, where reading it off the current page would make the
// badge depend on which page you happen to be looking at.
const useLatestWitnessVersion = (enabled: boolean = true) => {
  const { data: latestVersion, isLoading: isLatestVersionLoading } = useQuery({
    queryKey: ["latestWitnessVersion"],
    queryFn: async () => {
      const response = await fetchingService.getWitnesses(
        1,
        1,
        "version",
        "desc"
      );
      return {
        version: response?.witnesses?.[0]?.version ?? null,
        totalWitnesses: response?.total_witnesses ?? 0,
      };
    },
    refetchOnWindowFocus: false,
    enabled,
  });

  return {
    latestVersion: latestVersion?.version ?? null,
    totalWitnesses: latestVersion?.totalWitnesses ?? 0,
    isLatestVersionLoading,
  };
};

export default useLatestWitnessVersion;
