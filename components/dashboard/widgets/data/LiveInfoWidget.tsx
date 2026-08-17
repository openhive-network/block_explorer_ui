import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CurrentBlockCard from "@/components/home/CurrentBlockCard";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { useSettings } from "@/contexts/SettingsContext";
import { config } from "@/Config";

interface LiveInfoWidgetProps {
  headBlockCardData?: Explorer.HeadBlockCardData | any;
  blockDetails?: Hive.BlockDetails | null;
  transactionCount?: number;
  opcount?: number;
}

const calculateTimeDifference = (createdAt: string, blockchainDate: number) => {
  const timeDifference = Math.abs(
    blockchainDate - new Date(createdAt).getTime()
  );
  return Math.floor(timeDifference / 1000);
};

const LiveInfoWidget: React.FC<LiveInfoWidgetProps> = ({
  headBlockCardData,
  transactionCount,
  blockDetails,
  opcount = 0,
}) => {
  const { settings } = useSettings();

  const blockchainTime = headBlockCardData?.headBlockDetails.blockchainTime;
  const blockchainDate = blockchainTime
    ? new Date(blockchainTime.replace(/\//g, "-").replace(" UTC", "")).getTime()
    : null;

  const [timeDifferenceInSeconds, setTimeDifferenceInSeconds] = useState<
    number | null
  >(null);
  const [liveBlockNumber, setLiveBlockNumber] = useState<number | null>(
    blockDetails?.block_num ?? null
  );
  const intervalTime = config.accountRefreshInterval;

  useEffect(() => {
    if (!blockDetails?.created_at || !blockchainDate) return;
    setTimeDifferenceInSeconds(
      calculateTimeDifference(blockDetails.created_at, blockchainDate)
    );
  }, [blockDetails?.created_at, blockchainDate]);

  useEffect(() => {
    if (!blockDetails?.block_num || !settings.liveData) return;
    setLiveBlockNumber(blockDetails.block_num);
    const intervalId = setInterval(() => {
      setLiveBlockNumber((prev) => (prev ? prev + 1 : blockDetails.block_num));
    }, intervalTime);
    return () => clearInterval(intervalId);
  }, [blockDetails?.block_num, settings.liveData, intervalTime]);

  return (
    <Card className="w-full flex flex-col mb-1">
      <CardContent className="px-3 pt-2 pb-2 space-y-1 overflow-y-auto">
        <CurrentBlockCard
          blockDetails={blockDetails}
          transactionCount={transactionCount}
          opcount={opcount}
          timeDifferenceInSeconds={timeDifferenceInSeconds}
          liveBlockNumber={liveBlockNumber}
          isLive={settings.liveData}
        />
      </CardContent>
    </Card>
  );
};

export default LiveInfoWidget;
