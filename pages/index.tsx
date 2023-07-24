import fetchingService from '@/services/FetchingService';
import { useQuery } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const dynamicGlobalQuery = useQuery({
    queryKey: [`global`],
    queryFn: () => fetchingService.getDynamicGlobalProperties()
  });
  const currentPriceFeed = useQuery({
    queryKey: [`priceFeed`],
    queryFn: () => fetchingService.getCurrentPriceFeed()
  });
  const rewardFunds = useQuery({
    queryKey: [`reward`],
    queryFn: () => fetchingService.getRewardFunds()
  });

  
  const operationsByBlock = useQuery({
    queryKey: ["operationsByBlock"],
    queryFn: () => fetchingService.getOpsByBlock(9000001 || 0, []),
    enabled: !!dynamicGlobalQuery.data?.result.head_block_number
  }) 

  console.log('DYNAMIC', dynamicGlobalQuery.data?.result.head_block_number, operationsByBlock.data);



  return (
      <div>Home</div>
  )
}
