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
import { useUserSettingsContext } from "@/components/contexts/UserSettingsContext";
import Head from "next/head";

export default function Home() {
  const { settings } = useUserSettingsContext();
  const witnesses = useWitnesses(config.witnessesPerPages.home).witnessesData;
  const headBlockNum = useHeadBlockNumber(
    settings.liveData
  ).headBlockNumberData;
  const dynamicGlobalQueryData =
    useDynamicGlobal(headBlockNum).dynamicGlobalData;
  const headBlockData = useHeadBlock(headBlockNum).headBlockData;
  const blockOperations = useBlockOperations(
    headBlockNum || 0,
    []
  ).blockOperations;

  return (
    <>
      <Head>
        <title>Hive Explorer</title>
      </Head>
      <div className="grid grid-cols-3 text-white px-2 md:mx-8 w-full">
        <HeadBlockCard
          headBlockCardData={dynamicGlobalQueryData}
          transactionCount={blockOperations?.operations_result?.length}
          blockDetails={headBlockData}
        />
        <div className="col-start-1 md:col-start-2 col-span-6 md:col-span-2">
          <LastBlocksWidget headBlock={headBlockNum} className="mt-6 md:mt-0" />
          <SearchesSection />
        </div>
        <div
          className="col-start-1 md:col-start-4 col-span-6 md:col-span-1 bg-explorer-dark-gray py-2 rounded text-xs	overflow-hidden md:mx-6 h-fit"
          data-testid="top-witnesses-sidebar"
        >
          <div className="text-lg text-center">Top Witnesses</div>
          <Table>
            <TableBody>
              {witnesses &&
                witnesses.map((witness, index) => (
                  <TableRow
                    className=" text-base"
                    key={index}
                    data-testid="witnesses-name"
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Link
                        href={`/@${witness.witness}`}
                        className="text-explorer-turquoise"
                      >
                        {witness.witness}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/@${witness.witness}`}>
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
            <Link data-testid="see-more-btn" href={"/witnesses"}>
              See More
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
