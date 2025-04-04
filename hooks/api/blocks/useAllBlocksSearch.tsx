import { useQuery } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";



const useAllBlocksSearch = (
  allBlockSearchProps?: Explorer.AllBlocksSearchProps, 
  page?: number,
  toBlock?: number,
) => {
  const {
    data: blocksSearchData,
    isFetching: blocksSearchDataLoading,
    isError: blocksSearchDataError,
  } = useQuery({
    queryKey: ["blockSearch", allBlockSearchProps],
    queryFn: () => fetchAllBlocks(allBlockSearchProps, page, toBlock),
    refetchOnWindowFocus: false,
  });
  const fetchAllBlocks = async (
    allBlockSearchProps: Explorer.AllBlocksSearchProps | undefined , 
    page:number | undefined,
    toBlock : number|undefined,
  ) => {
    const response = await fetchingService.getAllBlocksByOp(allBlockSearchProps,page,toBlock);
    return response;
  };

  return { blocksSearchData, blocksSearchDataLoading, blocksSearchDataError };
};

export default useAllBlocksSearch;
