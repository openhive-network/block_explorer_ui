import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Explorer from "@/types/Explorer";

const useBlockByTime = () => {

  const checkBlockByTime = async (date: Date) => {
      return await fetchingService.getBlockByTime(date);
  }

  return { checkBlockByTime };
};

export default useBlockByTime;
