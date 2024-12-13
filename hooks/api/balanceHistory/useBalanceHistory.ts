import { UseQueryResult, useQuery } from "@tanstack/react-query";
import moment from "moment";

import fetchingService from "@/services/FetchingService";

const useBalanceHistory = (
  accountName: string,
  coinType:string,
  page: number | undefined,
  pageSize : number | undefined,
  direction: "asc" | "desc",
  fromDate?: Date | number | undefined,
  toDate?: Date| number |undefined,
  
) => {

  /*const isDatesCorrect =
    !moment(fromDate).isSame(toDate) && !moment(fromDate).isAfter(toDate);*/
    const isDatesCorrect =true;
  const fetchBalanceHist = async () =>
    await fetchingService.geAccounttBalanceHistory(
      accountName,
      coinType,
      page?page:1,
      pageSize,
      direction,
      fromDate?fromDate:undefined,
      toDate?toDate:undefined,
    );

  const {
    data: accountBalanceHistory,
    isLoading: isAccountBalanceHistoryLoading,
    isError: isAccountBalanceHistoryError,
  }: any = useQuery({
    queryKey: [
      "get_balance_history",
      accountName,
      coinType,
      page,
      pageSize,
      direction,
      fromDate,
      toDate,
    ],
    queryFn: fetchBalanceHist,
    enabled: !!accountName && isDatesCorrect,
    refetchOnWindowFocus: false,
  });
  return {
    accountBalanceHistory,
    isAccountBalanceHistoryLoading,
    isAccountBalanceHistoryError,
  };
  
};

export default useBalanceHistory;
