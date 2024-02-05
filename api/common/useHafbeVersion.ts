import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useHafbeVersion = () => {
  const {
    data: hafbeVersionData,
    isLoading: hafbeVersionDataLoading,
    isError: hafbeVersionDataError,
  } = useQuery({
    queryKey: ["hafbeVersion"],
    queryFn: () => fetchingService.getHafbeVersion(),
    refetchOnWindowFocus: false,
    select: (hafbeHash) => hafbeHash.slice(0, 8)
  });

  return { hafbeVersionData, hafbeVersionDataLoading, hafbeVersionDataError };
};

export default useHafbeVersion;
