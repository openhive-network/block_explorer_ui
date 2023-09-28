import fetchingService from '@/services/FetchingService';
import { useQuery } from '@tanstack/react-query';
import OperationCard from '@/components/OperationCard';
import Hive from '@/types/Hive';
import { adjustDynamicGlobalBlockData } from '@/utils/QueryDataSelectors';
import HeadBlockCard from '@/components/home/HeadBlockCard';
import Link from "next/link";
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Image from "next/image"
import {getHiveAvatarUrl} from "@/utils/HiveBlogUtils"
import BlockSearchSection from '@/components/home/BlockSearchSection';
import Explorer from '@/types/Explorer';
import { useEffect, useState } from 'react';

export default function Home() {

  const [foundBlocksIds, setFoundBlocksIds] = useState<number[] | null>(null);
  const [operationKeysChain, setOpertionKeysChain] = useState<string[] | null>(null);
  const [currentOperationKeys, setCurrentOperationKeys] = useState<string[] | null>(null);
  const [blockSearchLoading, setBlochSearchLoading] = useState<boolean>(false);

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
  })

  const witnessesQuery = useQuery({
    queryKey: ["witnesses"],
    queryFn: () => fetchingService.getWitnesses(20, 0, "votes", "desc"),
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
  }) 

  const operationsTypes = useQuery({
    queryKey: ["operationsNames"],
    queryFn: () => fetchingService.getOperationTypes(""),
    refetchOnWindowFocus: false,
  })



  const getBlockDataForSearch = async (blockSearchProps: Explorer.BlockSearchProps) => {
    setBlochSearchLoading(true);
    const {accountName, operations, fromBlock, toBlock, limit, deepProps} = blockSearchProps;
    let deepPropsKey: string[] | null = deepProps.keys && deepProps.keys.length !== 0 ? deepProps.keys : null;
    const blocks = await fetchingService.getBlockByOp(operations, accountName, fromBlock, toBlock, limit, "desc", deepProps.content, deepPropsKey);
    setFoundBlocksIds(blocks);
    setBlochSearchLoading(false);
  }



  const getOperationKeys = async (operationId: number | null, nextKey?: string) => {
    if (operationId !== null) {
      let completeKeysChain: string[] = [];
      if (operationKeysChain) completeKeysChain = [...operationKeysChain];
      if (nextKey) {
        completeKeysChain = [...completeKeysChain, nextKey];
      } else {
        completeKeysChain = [];
      }
    
      const nextKeys = await fetchingService.getOperationKeys(operationId, completeKeysChain);
      setCurrentOperationKeys(nextKeys);
      setOpertionKeysChain(completeKeysChain);
    } else {
      setCurrentOperationKeys(null);
      setOpertionKeysChain(null);
    }
  }
  
  let operations: Hive.Operation[] = operationsByBlock.data?.map((operationByBlock) => {
    return operationByBlock.operation
  }) || [];
  
  return (
      <div className='grid grid-cols-4 text-white mx-4 md:mx-8 w-full'>
        <HeadBlockCard 
          headBlockCardData={dynamicGlobalQuery.data}
          transactionCount={operationsByBlock.data?.length || 0}
        />
        <div className="col-start-1 md:col-start-2 col-span-6 md:col-span-2">
          <BlockSearchSection 
            getBlockDataForSearch={getBlockDataForSearch} 
            getOperationKeys={getOperationKeys} 
            operationsTypes={operationsTypes.data || []} 
            foundBlocksIds={foundBlocksIds} 
            currentOperationKeys={currentOperationKeys} 
            operationKeysChain={operationKeysChain}
            loading={blockSearchLoading}
          />
        </div>
        <div className="col-start-1 md:col-start-4 col-span-6 md:col-span-1 mt-6 bg-explorer-dark-gray py-2 rounded-[6px] text-xs	overflow-hidden md:mx-6">
            <div className=' text-lg text-center'>Top Witnesses</div>
            <Table>
              <TableBody>
              {witnessesQuery.data && witnessesQuery.data.map((witness, index) => (
                <TableRow className=' text-base' key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell><Link href={`/account/${witness.witness}`}>{witness.witness}</Link></TableCell>
                  <TableCell><Link href={`/account/${witness.witness}`}><Image className="rounded-full" src={getHiveAvatarUrl(witness.witness)} alt="avatar" width={40} height={40} /></Link>  </TableCell>
                 
                </TableRow>
              ))}
              </TableBody>
            </Table>

        </div>
      </div>
  )
}
