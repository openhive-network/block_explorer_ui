import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  useHeadBlockNumber,
  useLiveHeadBlock,
} from "@/contexts/HeadBlockContext";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import useWitnessesSchedule from "@/hooks/api/schedulePage/useWitnessesSchedule";
import WitnessSchedule from "@/components/schedule/WitnessSchedule";
import WidgetUnavailable from "@/components/dashboard/ui/WidgetUnavailable";

interface WitnessScheduleWidgetProps {
  fill?: boolean;
}

const WitnessScheduleWidget: React.FC<WitnessScheduleWidgetProps> = ({
  fill = true,
}) => {
  // The same claim the /schedule page makes: this view is only alive while the
  // head block advances, and it renders on the dashboard where nothing else
  // asks for it.
  useLiveHeadBlock();
  // 100, not the page's 200: anything below that shows "-" for its rank.
  const { witnessesData } = useWitnesses(100, "rank", "asc");
  const { headBlockNumberData } = useHeadBlockNumber();
  const { headBlockData } = useHeadBlock(headBlockNumberData);

  const {
    scheduledWitnessesData,
    setBlockSchedule,
    refetchWitnessSchedule,
    nextShuffleBlockNumber,
    blocksLeftBeforeRefetch,
    isWitnessScheduleLoading,
    isWitnessScheduleError,
  } = useWitnessesSchedule(
    witnessesData?.witnesses || [],
    headBlockNumberData || ""
  );

  // Past the shuffle block the cached order is stale.
  useEffect(() => {
    if (blocksLeftBeforeRefetch < 0) {
      setBlockSchedule({});
      refetchWitnessSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksLeftBeforeRefetch]);

  if (isWitnessScheduleError) return <WidgetUnavailable transient />;

  const isLoading =
    isWitnessScheduleLoading || !nextShuffleBlockNumber || !headBlockNumberData;

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center",
          fill ? "h-full" : "min-h-[140px]"
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "[&>div]:rounded [&>div]:shadow-sm",
        fill ? "h-full [&>div]:h-full" : "mb-2"
      )}
    >
      <WitnessSchedule
        data={scheduledWitnessesData}
        currentProducer={headBlockData?.producer_account}
        currentBlock={headBlockNumberData}
        nextShuffleBlockNumber={nextShuffleBlockNumber}
        blocksLeftBeforeRefetch={blocksLeftBeforeRefetch}
      />
    </div>
  );
};

export default WitnessScheduleWidget;
