import fetchingService from "@/services/FetchingService";

const useBlockByTime = () => {
  const checkBlockByTime = async (date: Date) => {
    return await fetchingService.getBlockByTime(date);
  };

  return { checkBlockByTime };
};

export default useBlockByTime;
