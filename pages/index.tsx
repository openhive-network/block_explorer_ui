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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <div className="grid grid-cols-4 text-white px-2 w-full gap-3">
        <HeadBlockCard
          headBlockCardData={dynamicGlobalQueryData}
          transactionCount={blockOperations?.operations_result?.length}
          blockDetails={headBlockData}
        />
        <div className="col-span-4 md:col-span-3 lg:col-span-2">
          <LastBlocksWidget headBlock={headBlockNum} />
          <SearchesSection />
        </div>
        <Card
          className="col-span-4 md:col-span-4 lg:col-span-1"
          data-testid="top-witnesses-sidebar"
        >
          <CardHeader>
            <CardTitle>Top Witnesses</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableBody>
                {witnesses &&
                  witnesses.map((witness, index) => (
                    <TableRow
                      className=" text-base"
                      key={index}
                      data-testid="witnesses-name"
                    >
                      <TableCell className="py-4">{index + 1}</TableCell>
                      <TableCell className="py-4">
                        <Link
                          href={`/@${witness.witness}`}
                          className="text-explorer-turquoise"
                        >
                          {witness.witness}
                        </Link>
                      </TableCell>
                      <TableCell className="py-4">
                        <Link href={`/@${witness.witness}`}>
                          <div className="min-w-[30px]">
                            <Image
                              className="rounded-full border-2 border-explorer-turquoise"
                              src={getHiveAvatarUrl(witness.witness)}
                              alt="avatar"
                              width={40}
                              height={40}
                            />
                          </div>
                        </Link>{" "}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-center align-center text-lg hover:text-explorer-turquoise">
              <Link
                data-testid="see-more-btn"
                href={"/witnesses"}
                className="hover:text-explorer-turquoise"
              >
                See More
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
