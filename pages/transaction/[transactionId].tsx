
import { useRouter } from 'next/router';
import { useQuery  } from '@tanstack/react-query';
import fetchingService from '@/services/FetchingService';


export default function Transaction() {

  const router = useRouter();
  const transactionId = router.query.transactionId as string;
  const trasnactionQuery = useQuery({
    queryKey: [`block-${router.query.transactionId}`],
    queryFn: () => fetchingService.getTransaction(transactionId)
  }) 

  return (
    <div>Transaction</div>
  )
}