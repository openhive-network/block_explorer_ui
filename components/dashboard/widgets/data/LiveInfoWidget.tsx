import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CurrentBlockCard from "@/components/home/CurrentBlockCard";
import LiveDataHeader from "@/components/home/LiveDataHeader";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { useSettings } from "@/contexts/SettingsContext";
import { config } from "@/Config";
import useBlockchainSyncInfo from "@/hooks/common/useBlockchainSyncInfo";
import { getBlockDifference } from "@/components/home/SyncInfo";

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

const getFormattedLiveBlockchainTime = (time: Date | null) => {
  if (!time) return "";
  return `${
    time.toISOString().replace("T", " ").replaceAll("-", "/").split(".")[0]
  } UTC`;
};

const LiveInfoWidget: React.FC<LiveInfoWidgetProps> = ({
  headBlockCardData,
  transactionCount,
  blockDetails,
  opcount = 0,
}) => {
  const { settings, updateSettings } = useSettings();
  const {
    explorerBlockNumber,
    hiveBlockNumber,
    loading: isLoading,
  } = useBlockchainSyncInfo();

  const blockchainTime = headBlockCardData?.headBlockDetails.blockchainTime;
  const blockchainDate = blockchainTime
    ? new Date(blockchainTime.replace(/\//g, "-").replace(" UTC", "")).getTime()
    : null;

  const [timeDifferenceInSeconds, setTimeDifferenceInSeconds] = useState<
    number | null
  >(null);
  const [liveBlockchainTime, setLiveBlockchainTime] = useState<Date | null>(
    null
  );
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
    if (!blockchainDate || !settings.liveData) return;
    const initialTimeDifference = Date.now() - blockchainDate;
    setLiveBlockchainTime(new Date(blockchainDate + initialTimeDifference));
    const intervalId = setInterval(() => {
      setLiveBlockchainTime(
        new Date(blockchainDate + (Date.now() - blockchainDate))
      );
    }, intervalTime);
    return () => clearInterval(intervalId);
  }, [blockchainDate, settings.liveData, intervalTime]);

  useEffect(() => {
    if (!blockDetails?.block_num || !settings.liveData) return;
    setLiveBlockNumber(blockDetails.block_num);
    const intervalId = setInterval(() => {
      setLiveBlockNumber((prev) => (prev ? prev + 1 : blockDetails.block_num));
    }, intervalTime);
    return () => clearInterval(intervalId);
  }, [blockDetails?.block_num, settings.liveData, intervalTime]);

  const isLiveDataToggleDisabled =
    getBlockDifference(hiveBlockNumber, explorerBlockNumber) >
      config.liveblockSecurityDifference || isLoading;

  return (
    <Card className="w-full flex flex-col mb-1">
      <LiveDataHeader
        blockchainTime={
          settings.liveData && liveBlockchainTime
            ? getFormattedLiveBlockchainTime(liveBlockchainTime)
            : (blockchainTime ?? "")
        }
        liveData={settings.liveData}
        onToggleLiveData={() =>
          updateSettings({ ...settings, liveData: !settings.liveData })
        }
        toggleDisabled={isLiveDataToggleDisabled}
      />

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
