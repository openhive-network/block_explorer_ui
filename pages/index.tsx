import React from "react";
import Image from "next/image";
import Link from "next/link";
import HeadBlockCard from "@/components/home/HeadBlockCard";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import SearchesSection from "@/components/home/SearchesSection";
import LastBlocksWidget from "@/components/LastBlocksWidget";
import useWitnesses from "@/api/common/useWitnesses";
import useDynamicGlobal from "@/api/homePage/useDynamicGlobal";
import { config } from "@/Config";
import useHeadBlockNumber from "@/api/common/useHeadBlockNum";
import useHeadBlock from "@/api/homePage/useHeadBlock";
import useBlockOperations from "@/api/common/useBlockOperations";

export default function Home() {
  const dynamicGlobalQueryData = useDynamicGlobal().dynamicGlobalData;
  const wintesses = useWitnesses(config.witnessesPerPages.home).witnessData;
  const headBlockNum = useHeadBlockNumber().headBlockNumberData;
  const headBlockData = useHeadBlock(headBlockNum).headBlockData;
  const blockOperations = useBlockOperations(headBlockNum || 0, []).blockOperations;

  return (
    <div className="grid grid-cols-3 text-white mx-4 md:mx-8 w-full">
      <HeadBlockCard
        headBlockCardData={dynamicGlobalQueryData}
        transactionCount={blockOperations?.length}
        blockDetails={headBlockData}
      />
      <div className="col-start-1 md:col-start-2 col-span-6 md:col-span-2">
      <LastBlocksWidget className="mt-6 md:mt-0"/>
        <SearchesSection />
      </div>
      <div className="col-start-1 md:col-start-4 col-span-6 md:col-span-1 bg-explorer-dark-gray py-2 rounded text-xs	overflow-hidden md:mx-6 h-fit"
           data-testid="top-witnesses-sidebar">
        <div className="text-lg text-center">Top Witnesses</div>
        <Table>
          <TableBody>
            {wintesses &&
              wintesses.map((witness, index) => (
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
        <div className="flex justify-center align-center text-lg hover:text-explorer-turquoise">
          <Link href={"/witnesses"}>See More</Link>
        </div>
      </div>
    </div>
  );
}
