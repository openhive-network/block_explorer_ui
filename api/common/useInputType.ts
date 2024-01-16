import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useInputType = (input: string) => {
  const {
    data: inputTypeData,
    isLoading: inputTypeDataLoading,
    isError: inputTypeDataError,
  } = useQuery({
    queryKey: ["inputType", input],
    queryFn: () => fetchingService.getInputType(input),
    refetchOnWindowFocus: false,
  });

  return {
    inputTypeData: !!input.length ? inputTypeData : null,
    inputTypeDataLoading,
    inputTypeDataError,
  };
};

export default useInputType;
