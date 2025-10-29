import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import CurrentBlockCard from "@/components/home/CurrentBlockCard";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { useSettings } from "@/contexts/SettingsContext";
import { useI18n } from "@/i18n/i18n";
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
  const { t } = useI18n();
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
      setLiveBlockNumber((prev) => (prev ? prev + 1 : blockDetails.block_num)); // Simplified increment
    }, intervalTime);
    return () => clearInterval(intervalId);
  }, [blockDetails?.block_num, settings.liveData, intervalTime]);

  const isLiveDataToggleDisabled =
    getBlockDifference(hiveBlockNumber, explorerBlockNumber) >
      config.liveblockSecurityDifference || isLoading;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="py-2 border-b px-4 space-y-1">
        <div className="flex items-center justify-end space-x-2 text-xs">
          <Clock size={16} />
          <span className="font-semibold">
            {t("headBlockCard.blockchainTime")}:
          </span>
          <span className="font-semibold">
            {settings.liveData && liveBlockchainTime
              ? getFormattedLiveBlockchainTime(liveBlockchainTime)
              : blockchainTime ?? ""}
          </span>
        </div>

        <div className="flex items-center justify-end space-x-2 text-xs">
          <span className="text-sm font-medium">
            {t("headBlockCard.liveData")}
          </span>
          <Toggle
            disabled={isLiveDataToggleDisabled}
            checked={settings.liveData}
            onClick={() =>
              updateSettings({ ...settings, liveData: !settings.liveData })
            }
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 overflow-y-auto">
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
