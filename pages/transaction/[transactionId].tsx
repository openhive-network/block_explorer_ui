
import { useRouter } from 'next/router';
import { useQuery  } from '@tanstack/react-query';
import fetchingService from '@/services/FetchingService';
import Explorer from '@/types/Explorer';

const displayTransactionData = (key: string, value: string | string[] | number) => {
  if (!["operations", "signatures"].includes(key)) 
    return (
      <tr className='border-b border-solid border-gray-700 max-w-full overflow-hidden'>
        <td className='pl-4 py-1'>{(key.charAt(0).toUpperCase() + key.slice(1)).replaceAll("_", " ")}</td>
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

  console.log(data)

  return (
    <div className='w-full max-w-5xl px-4'>
      {!isLoading && !!data && 
      <>
        <div className='mt-10 w-full bg-explorer-dark-gray px-4 py-2 rounded-[6px] flex flex-col items-center text-3xl'>
          <div>Transaction {data.transaction_id}</div>
          <div>in block {data.block_num} at {data.timestamp} UTC</div>
        </div>
        <div className='mt-6 w-full bg-explorer-dark-gray px-4 py-2 rounded-[6px]'>
          <div className='flex justify-center text-3xl'>Operation type</div>
        </div>
        <div className='mt-6 w-full bg-explorer-dark-gray py-2 rounded-[6px] px-2'>
          <div className='flex justify-center text-3xl'>Raw transaction</div>
          <table className='w-full'>
            {Object.keys(data).map((key) => displayTransactionData(key, data[key as keyof Omit<Explorer.TransactionQueryResponse, "operations">]))}
          </table>
          <div>
            <div className='pl-4'>Operations</div>

          </div>
        </div>
      </>}
    </div>
  )
}