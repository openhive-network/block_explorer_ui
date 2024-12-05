import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import ErrorPage from "./ErrorPage";
import WitnessSchedule from "@/components/schedule/WitnessSchedule";
import BackupWitnessSchedule from "@/components/schedule/BackupWitnessSchedule";
import useWitnessesSchedule from "@/hooks/api/schedulePage/useWitnessesSchedule";
import useBackupWitnessesSchedule from "@/hooks/api/schedulePage/useBackupWitnessesSchedule";

const Schedule = () => {
  const { witnessesData } = useWitnesses(200, "rank", "asc");
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

  const {
    backupWitnessScheduleData,
    isBackupWitnessScheduleLoading,
    isBackupWitnessScheduleError,
    refetchBackupWitnessSchedule,
  } = useBackupWitnessesSchedule(
    witnessesData?.witnesses || [],
    headBlockNumberData || ""
  );

  const producerAccount = headBlockData?.producer_account;

  useEffect(() => {
    if (blocksLeftBeforeRefetch < 0) {
      setBlockSchedule({});
      refetchWitnessSchedule();
      refetchBackupWitnessSchedule();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksLeftBeforeRefetch]);

  if (isWitnessScheduleError || isBackupWitnessScheduleError)
    return <ErrorPage />;

  const isDataLoading =
    isWitnessScheduleLoading ||
    isBackupWitnessScheduleLoading ||
    !nextShuffleBlockNumber ||
    !headBlockNumberData;

  return isDataLoading ? (
    <div className="flex justify-center items-center">
      <Loader2 className="animate-spin mt-1 h-12 w-12 ml-3 ..." />
    </div>
  ) : (
    <div className="w-full grid lg:grid-cols-2 gap-4 content-start px-[1rem] md:px-[5rem] ">
      <WitnessSchedule
        data={scheduledWitnessesData}
        currentProducer={producerAccount}
        currentBlock={headBlockNumberData}
        nextShuffleBlockNumber={nextShuffleBlockNumber}
        blocksLeftBeforeRefetch={blocksLeftBeforeRefetch}
      />

      <BackupWitnessSchedule data={backupWitnessScheduleData} />
    </div>
  );
};

export default Schedule;
