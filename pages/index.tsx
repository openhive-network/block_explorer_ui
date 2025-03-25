import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { MoveRight } from "lucide-react";

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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import { useTheme } from "@/contexts/ThemeContext";
import useMarketHistory from "@/hooks/common/useMarketHistory";
import MarketHistoryChart from "@/components/home/MarketHistoryChart";
import moment from "moment";

const MARKET_HISTORY_INTERVAL = 86400; // 1 day
const CURRENT_TIME = moment().format("YYYY-MM-DDTHH:mm:ss");
const MARKET_HISTORY_TIME_PERIOD = moment()
  .subtract(30, "days")
  .format("YYYY-MM-DDTHH:mm:ss");

export default function Home() {
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

  const { marketHistory, isMarketHistoryLoading } = useMarketHistory(
    MARKET_HISTORY_INTERVAL,
    MARKET_HISTORY_TIME_PERIOD,
    CURRENT_TIME
  );

  // Filter operations that have a trx_id
  const trxOperations = blockOperations?.operations_result.filter(
    (operation) => operation.trx_id
  );

  const [opcount, setOpcount] = useState<number>(0);
  const [trxOpsLength, setTrxOpLength] = useState<number>(0);

  useEffect(() => {
    if (blockOperations?.total_operations) {
      setOpcount(blockOperations?.total_operations);
    }
    if (trxOperations) {
      setTrxOpLength(trxOperations.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockOperations?.total_operations, trxOperations?.length]);

  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  return (
    <>
      <Head>
        <title>Hive Explorer</title>
      </Head>
      <div className=" page-container grid grid-cols-4 text-white gap-3">
        <HeadBlockCard
          headBlockCardData={dynamicGlobalQueryData}
          transactionCount={trxOpsLength}
          blockDetails={headBlockData}
          opcount={opcount}
        />
        <div className="col-span-4 md:col-span-3 lg:col-span-2">
          <MarketHistoryChart
            data={marketHistory}
            isLoading={isMarketHistoryLoading}
            strokeColor={strokeColor}
          />
          <LastBlocksWidget
            headBlock={headBlockNum}
            strokeColor={strokeColor}
          />
          <SearchesSection />
        </div>

        <Card
          className="col-span-4 md:col-span-4 lg:col-span-1 overflow-hidden"
          data-testid="top-witnesses-sidebar"
        >
          <CardHeader className="flex justify-between items-center border-b px-1 py-3">
            <CardTitle>Top Witnesses</CardTitle>
            <Link
              href="/witnesses"
              className="text-sm flex items-center space-x-1"
              data-testid="see-witnesses-link"
            >
              <span>See All</span>
              <MoveRight width={18} />
            </Link>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <Table>
              <TableBody>
                {witnesses &&
                  witnesses.witnesses.map((witness, index) => (
                    <TableRow
                      className="text-base"
                      key={index}
                      data-testid="witnesses-name"
                    >
                      <TableCell className="py-2">{index + 1}</TableCell>
                      <TableCell className="py-2">
                        <Link
                          href={`/@${witness.witness_name}`}
                          className="text-link"
                        >
                          {witness.witness_name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link href={`/@${witness.witness_name}`}>
                          <div className="min-w-[30px]">
                            <Image
                              className="rounded-full border-2 border-link transition-all transform hover:scale-110"
                              src={getHiveAvatarUrl(witness.witness_name)}
                              alt="avatar"
                              width={40}
                              height={40}
                            />
                          </div>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="py-4 px-4 bg-explorer-extra-light-gray">
            <div className="w-full flex justify-center">
              <Link
                data-testid="see-more-btn"
                href="/witnesses"
                className="text-link"
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
