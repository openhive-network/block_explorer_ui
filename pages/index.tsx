import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import fetchingService from "@/services/FetchingService";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import Hive from "@/types/Hive";
import HeadBlockCard from "@/components/home/HeadBlockCard";
import { adjustDynamicGlobalBlockData } from "@/utils/QueryDataSelectors";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import BlockSearchSection from "@/components/home/BlockSearchSection";
import Explorer from "@/types/Explorer";
import LastBlocksWidget from "@/components/LastBlocksWidget";

export default function Home() {
  const [foundBlocksIds, setFoundBlocksIds] = useState<number[] | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[] | null>(
    null
  );
  const [operationKeys, setOperationKeys] = useState<
    string[][] | null
  >(null);
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
  });

  const witnessesQuery = useQuery({
    queryKey: ["witnesses"],
    queryFn: () => fetchingService.getWitnesses(20, 0, "votes", "desc"),
    refetchOnWindowFocus: false,
  });

  const { data: headBlockNum } = useQuery({
    queryKey: ["headBlockNum"],
    queryFn: () => fetchingService.getHeadBlockNum(),
    refetchOnWindowFocus: false,
  });

  const { data: headBlockData } = useQuery({
    queryKey: ["headBlockData", headBlockNum],
    queryFn: () => fetchingService.getBlock(headBlockNum || 0),
    refetchOnWindowFocus: false,
  });

  const {
    data: blockOperations,
  }: UseQueryResult<Hive.OperationResponse[]> = useQuery({
    queryKey: [`block_operations`, headBlockNum],
    queryFn: () => fetchingService.getOpsByBlock(headBlockNum || 0, []),
    refetchOnWindowFocus: false,
  });

  const { data: operationsByBlock } = useQuery<
    Hive.OperationResponse[],
    Error
  >({
    queryKey: ["operationsByBlock"],
    queryFn: () =>
      fetchingService.getOpsByBlock(
        dynamicGlobalQuery.data?.headBlockNumber || 0,
        []
      ),
    enabled: !!dynamicGlobalQuery.data?.headBlockNumber,
    refetchOnWindowFocus: false,
  });

  const operationsTypes = useQuery({
    queryKey: ["operationsNames"],
    queryFn: () => fetchingService.getOperationTypes(""),
    refetchOnWindowFocus: false,
  });

  const getBlockDataForSearch = async (
    blockSearchProps: Explorer.BlockSearchProps
  ) => {
    setBlochSearchLoading(true);
    const foundBlocks = await fetchingService.getBlockByOp(
      blockSearchProps
    );
    setFoundBlocksIds(foundBlocks.map(foundBlock => foundBlock.block_num));
    setBlochSearchLoading(false);
  };

  const getOperationKeys = async (
    operationId: number | null
  ) => {
    if (operationId !== null) {

      const nextKeys = await fetchingService.getOperationKeys(
        operationId
      );
      setOperationKeys(nextKeys);
      setSelectedKeys(null);
    } else {
      setOperationKeys(null);
      setSelectedKeys(null);
    }
  };

  const setProperKeysForProperty = (index: number | null) => {
    if (index !== null && operationKeys?.[index]) {
      setSelectedKeys(operationKeys[index]);
    } else {
      setSelectedKeys(null);
    }
  }

  return (
    <div className="grid grid-cols-4 text-white mx-4 md:mx-8 w-full">
      <HeadBlockCard
        headBlockCardData={dynamicGlobalQuery.data}
        transactionCount={blockOperations?.length}
        blockDetails={headBlockData}
      />
      <div className="col-start-1 md:col-start-2 col-span-6 md:col-span-2">
        <LastBlocksWidget className="mt-6 md:mt-0"/>
        <BlockSearchSection
          getBlockDataForSearch={getBlockDataForSearch}
          getOperationKeys={getOperationKeys}
          setSelectedKeys={setProperKeysForProperty}
          operationsTypes={operationsTypes.data || []}
          foundBlocksIds={foundBlocksIds}
          currentOperationKeys={operationKeys}
          operationKeysChain={selectedKeys}
          loading={blockSearchLoading}
        />
      </div>
      <div className="col-start-1 md:col-start-4 col-span-6 md:col-span-1 bg-explorer-dark-gray py-2 rounded-[6px] text-xs	overflow-hidden md:mx-6">
        <div className="text-lg text-center">Top Witnesses</div>
        <Table>
          <TableBody>
            {witnessesQuery.data &&
              witnessesQuery.data.map((witness, index) => (
                <TableRow className=" text-base" key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`/account/${witness.witness}`}
                      className="text-explorer-turquoise"
                    >
                      {witness.witness}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/account/${witness.witness}`}>
                      <Image
                        className="rounded-full border-2 border-explorer-turquoise"
                        src={getHiveAvatarUrl(witness.witness)}
                        alt="avatar"
                        width={40}
                        height={40}
                      />
                    </Link>{" "}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
