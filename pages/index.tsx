import fetchingService from '@/services/FetchingService';
import { useQuery } from '@tanstack/react-query';
import OperationCard from '@/components/OperationCard';
import Hive from '@/types/Hive';
import { adjustDynamicGlobalBlockData } from '@/utils/QueryDataSelectors';
import HeadBlockCard from '@/components/home/HeadBlockCard';

export default function Home() {

  function getGlobalBlockData() {
    return Promise.all([fetchingService.getDynamicGlobalProperties(), fetchingService.getCurrentPriceFeed(), fetchingService.getRewardFunds()]);
  }


  const dynamicGlobalQuery = useQuery({
    queryKey: [`global`],
    queryFn: getGlobalBlockData,
    select: (dynamicGlobalBlockData) => adjustDynamicGlobalBlockData(dynamicGlobalBlockData[0], dynamicGlobalBlockData[1], dynamicGlobalBlockData[2])
  })

  
  const operationsByBlock = useQuery({
    queryKey: ["operationsByBlock"],
    queryFn: () => fetchingService.getOpsByBlock(dynamicGlobalQuery.data?.headBlockNumber || 0, []),
    enabled: !!dynamicGlobalQuery.data?.headBlockNumber
  }) 
  
  let operations: Hive.Operation[] = operationsByBlock.data?.map((operationByBlock) => {
    return operationByBlock.operation
  }) || [];
  
  return (
      <div className='grid grid-cols-4 text-white mx-4 md:mx-8'>
        <HeadBlockCard 
          headBlockCardData={dynamicGlobalQuery.data}
          transactionCount={operationsByBlock.data?.length || 0}
        />
        <div className="col-start-1 md:col-start-2 col-span-4 md:col-span-3">
          {operationsByBlock.isSuccess && operationsByBlock.data?.map(((operationByBlock, index) => (
            <OperationCard 
              key={index}
              blockNumber={operationByBlock.block}
              transactionId={operationByBlock.trx_id || ""}
              operation={operationByBlock.operation}
              date={new Date(operationByBlock.timestamp)}
              isVirtual={operationByBlock.virtual_op}
            />
          )))}
        </div>
      </div>
  )
}
