import fetchingService from "@/services/FetchingService";
import { useQuery } from "@tanstack/react-query";
import OperationCard from "@/components/OperationCard";
import Hive from "@/types/Hive";
import { adjustDynamicGlobalBlockData } from "@/utils/QueryDataSelectors";
import HeadBlockCard from "@/components/home/HeadBlockCard";
import DetailedOperationCard from "@/components/DetailedOperationCard";

export default function Home() {
  function getGlobalBlockData() {
    return Promise.all([
      fetchingService.getDynamicGlobalProperties(),
      fetchingService.getCurrentPriceFeed(),
      fetchingService.getRewardFunds(),
    ]);
  }

  const dynamicGlobalQuery = useQuery({
    queryKey: [`global`],
    queryFn: getGlobalBlockData,
    select: (dynamicGlobalBlockData) =>
      adjustDynamicGlobalBlockData(
        dynamicGlobalBlockData[0],
        dynamicGlobalBlockData[1],
        dynamicGlobalBlockData[2]
      ),
    refetchOnWindowFocus: false,
  });

  const operationsByBlock = useQuery({
    queryKey: ["operationsByBlock"],
    queryFn: () =>
      fetchingService.getOpsByBlock(
        dynamicGlobalQuery.data?.headBlockNumber || 0,
        []
      ),
    enabled: !!dynamicGlobalQuery.data?.headBlockNumber,
    refetchOnWindowFocus: false,
  });

  let operations: Hive.Operation[] =
    operationsByBlock.data?.map((operationByBlock) => {
      return operationByBlock.operation;
    }) || [];

  return (
    <div className="grid grid-cols-6 text-white mx-4 md:mx-8 mt-20">
      <HeadBlockCard
        headBlockCardData={dynamicGlobalQuery.data}
        transactionCount={operationsByBlock.data?.length || 0}
      />
      <div className="col-start-1 md:col-start-3 col-span-6 md:col-span-4 flex flex-col gap-y-2 md:gap-y-6">
        {operationsByBlock.isSuccess &&
          operationsByBlock.data?.map((operationByBlock, index) => (
            <DetailedOperationCard
              key={index}
              blockNumber={operationByBlock.block}
              transactionId={operationByBlock.trx_id || ""}
              operation={operationByBlock.operation}
              date={new Date(operationByBlock.timestamp)}
            />
          ))}
      </div>
    </div>
  );
}
