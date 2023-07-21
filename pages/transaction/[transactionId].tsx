
import { useRouter } from 'next/router';
import { useQuery  } from '@tanstack/react-query';
import fetchingService from '@/services/FetchingService';
import Explorer from '@/types/Explorer';
import OperationCard from '@/components/OperationCard';
import { addSpacesAndCapitalizeFirst } from '@/utils/StringUtils';

const displayTransactionData = (key: string, value: string | string[] | number) => {
  if (!["operations", "signatures"].includes(key)) 
    return (
      <tr className='border-b border-solid border-gray-700 max-w-full overflow-hidden'>
        <td className='pl-4 py-1'>{addSpacesAndCapitalizeFirst(key)}</td>
        <td align='right' className='pr-4'>{value}</td>
      </tr>
    )
}

export default function Transaction() {
  const router = useRouter();
  const transactionId = router.query.transactionId as string;

  const {data, isLoading, error} = useQuery<Explorer.TransactionQueryResponse, Error>(
    [`block-${router.query.transactionId}`], 
    () => fetchingService.getTransaction(transactionId)
  )

  return (
    <div className='w-full max-w-5xl px-4 text-white'>
      {!isLoading && !!data && 
      <>
        <div className='mt-10 w-full bg-explorer-dark-gray px-4 py-2 rounded-[6px] flex flex-col items-center text-3xl'>
          <div>Transaction <span className='text-explorer-turquoise'>{data.transaction_id}</span></div>
          <div>in block 
            <span className='text-explorer-turquoise'>{" " + data.block_num}</span > at 
            <span className='text-explorer-turquoise'>{" " + data.timestamp} UTC</span>
          </div>
        </div>
        <OperationCard 
          operation={data.operations[0]}
          age={data.age}
          blockNumber={data.block_num}
          expiration={data.expiration}
          transactionId={data.transaction_id}
        />
        <div className='mt-6 w-full bg-explorer-dark-gray py-2 rounded-[6px] px-2'>
          <div className='flex justify-center text-3xl'>Raw transaction</div>
          <table className='w-full'>
            {Object.keys(data).map((key) => displayTransactionData(key, data[key as keyof Omit<Explorer.TransactionQueryResponse, "operations">]))}
          </table>
        </div>
      </>}
    </div>
  )
}