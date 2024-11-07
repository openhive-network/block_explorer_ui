import { useState, useEffect } from "react";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";
import { BackupWitness } from "@/components/schedule/BackupWitnessSchedule";
import useWitnessesSchedule from "./useWitnessesSchedule";
import { Witness } from "@/components/schedule/WitnessSchedule";

const useBackupWitnessesSchedule = (
  witnesses: Hive.Witness[],
  headBlockNumberData: number
) => {
  const queryClient = useQueryClient();
  const { scheduledWitnessesData } = useWitnessesSchedule(
    witnesses,
    headBlockNumberData
  );
  const {
    data,
    isLoading: isBackupWitnessScheduleLoading,
    isError: isBackupWitnessScheduleError,
    refetch: refetchBackupWitnessSchedule,
  }: UseQueryResult<Hive.WitnessesByVote[]> = useQuery({
    queryKey: ["witnesses_by_vote"],
    queryFn: () => fetchingService.getWitnessesByVote(),
  });

  const [backupWitnessScheduleData, setBackupWintessScheduleData] = useState<
    BackupWitness[]
  >([]);

  useEffect(() => {
    if (!data || (!data.length && !scheduledWitnessesData?.length)) return;
    const filterWitnessRank = buildBackupWitnessesSchedule(
      scheduledWitnessesData,
      data,
      witnesses
    );

    if (!filterWitnessRank) return;

    queryClient.invalidateQueries({ queryKey: ["witnesses_by_vote"] });

    setBackupWintessScheduleData(filterWitnessRank);
  }, [
    queryClient,
    data,
    scheduledWitnessesData,
    witnesses,
    headBlockNumberData,
  ]);

  return {
    backupWitnessScheduleData,
    isBackupWitnessScheduleLoading,
    isBackupWitnessScheduleError,
    refetchBackupWitnessSchedule,
  };
};

export default useBackupWitnessesSchedule;

const buildBackupWitnessesSchedule = (
  witnessesSchedule: Witness[],
  backupWitnessesSchedule: Hive.WitnessesByVote[],
  witnesses: Hive.Witness[]
) => {
  if (
    !witnessesSchedule?.length ||
    !backupWitnessesSchedule?.length ||
    !witnesses?.length
  )
    return;

  const namesSet = new Set(witnessesSchedule.map((obj) => obj.producerName));

  const rankMap = new Map(witnesses.map((obj) => [obj.witness_name, obj.rank]));

  const finalArray = backupWitnessesSchedule
    .filter((obj) => !namesSet.has(obj.owner))
    .map((obj) => {
      const timeDifferences =
        BigInt(obj.virtual_scheduled_time) - BigInt(obj.virtual_last_update);

      const timestamp = timeDifferences.toString();

      return {
        owner: obj.owner,
        timestamp,
        rank: rankMap.get(obj.owner) || null,
      };
    })
    .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

  return finalArray;
};
