import React from "react";
import Image from "next/image";
import Link from "next/link";
import HeadBlockCard from "@/components/home/HeadBlockCard";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import SearchesSection from "@/components/home/SearchesSection";
import LastBlocksWidget from "@/components/LastBlocksWidget";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { config } from "@/Config";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import useBlockOperations from "@/hooks/api/common/useBlockOperations";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";
import Head from "next/head";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { settings } = useUserSettingsContext();
  const { theme } = useTheme();

  const witnesses = useWitnesses(
    config.witnessesPerPages.home,
    "rank",
    "asc"
  ).witnessesData;
  const headBlockNum = useHeadBlockNumber().headBlockNumberData;
  const dynamicGlobalQueryData =
    useDynamicGlobal(headBlockNum).dynamicGlobalData;
  const headBlockData = useHeadBlock(headBlockNum).headBlockData;
  const { blockOperations } = useBlockOperations(headBlockNum || 0);
  const opcount = blockOperations?.operations_result?.length || 0;

  const strokeColor = theme === "dark" ? "#FFF" : "#000";

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
          opcount={opcount}
        />
        <div className="col-span-4 md:col-span-3 lg:col-span-2">
          <LastBlocksWidget
            headBlock={headBlockNum}
            strokeColor={strokeColor}
          />
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
                  witnesses.witnesses.map((witness, index) => (
                    <TableRow
                      className=" text-base"
                      key={index}
                      data-testid="witnesses-name"
                    >
                      <TableCell className="py-4">{index + 1}</TableCell>
                      <TableCell className="py-4">
                        <Link
                          href={`/@${witness.witness_name}`}
                          className="text-link"
                        >
                          {witness.witness_name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-4">
                        <Link href={`/@${witness.witness_name}`}>
                          <div className="min-w-[30px]">
                            <Image
                              className="rounded-full border-2 border-link"
                              src={getHiveAvatarUrl(witness.witness_name)}
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
