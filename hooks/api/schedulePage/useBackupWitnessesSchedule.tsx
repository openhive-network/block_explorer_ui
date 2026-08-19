import { useMemo } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { config } from "@/Config";
import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";
import { BackupWitness } from "@/components/schedule/BackupWitnessSchedule";
import useWitnessesSchedule from "./useWitnessesSchedule";

// Witnesses with this key are skipped by the chain, so they never take a turn.
const NULL_SIGNING_KEY = "STM1111111111111111111111111111111114T1Anm";
const SCHEDULE_QUEUE_LIMIT = 100;

const useBackupWitnessesSchedule = (
  witnesses: Hive.Witness[],
  headBlockNumberData: number
) => {
  const { shuffledWitnesses, futureShuffledWitnesses } = useWitnessesSchedule(
    witnesses,
    headBlockNumberData
  );

  const {
    data,
    isLoading: isBackupWitnessScheduleLoading,
    isError: isBackupWitnessScheduleError,
    refetch: refetchBackupWitnessSchedule,
  }: UseQueryResult<Hive.WitnessesByVote[]> = useQuery({
    queryKey: ["witnesses_by_schedule_time"],
    queryFn: () =>
      fetchingService.getWitnessesByScheduleTime(SCHEDULE_QUEUE_LIMIT),
    refetchOnWindowFocus: false,
    refetchInterval: config.mainRefreshInterval,
    keepPreviousData: true,
  });

  const backupWitnessScheduleData = useMemo(
    () =>
      buildBackupWitnessesSchedule(
        data,
        witnesses,
        shuffledWitnesses,
        futureShuffledWitnesses
      ),
    [data, witnesses, shuffledWitnesses, futureShuffledWitnesses]
  );

  return {
    backupWitnessScheduleData,
    isBackupWitnessScheduleLoading,
    isBackupWitnessScheduleError,
    refetchBackupWitnessSchedule,
  };
};

export default useBackupWitnessesSchedule;

const buildBackupWitnessesSchedule = (
  witnessesByScheduleTime: Hive.WitnessesByVote[] | undefined,
  witnesses: Hive.Witness[],
  shuffledWitnesses: string[] | undefined,
  futureShuffledWitnesses: string[] | undefined
): BackupWitness[] => {
  if (!witnessesByScheduleTime?.length || !shuffledWitnesses?.length) return [];

  const rankMap = new Map(
    (witnesses ?? []).map((obj) => [obj.witness_name, obj.rank])
  );
  const toBackupWitness = (owner: string): BackupWitness => ({
    owner,
    rank: rankMap.get(owner) ?? null,
  });

  const currentRound = new Set(shuffledWitnesses);
  const nextRound = new Set(futureShuffledWitnesses ?? []);

  // Elected seats carry over, so whoever is new to the next round is its backup.
  // Only the timeshare seat rotates, so there is at most one such witness.
  const decidedNext = (futureShuffledWitnesses ?? []).find(
    (name) => !currentRound.has(name)
  );

  // Taking a seat pushes a witness to the back, so both rounds are left out.
  const queue = witnessesByScheduleTime
    .filter(
      (witness) =>
        !currentRound.has(witness.owner) &&
        !nextRound.has(witness.owner) &&
        witness.signing_key !== NULL_SIGNING_KEY
    )
    .map((witness) => toBackupWitness(witness.owner));

  return decidedNext ? [toBackupWitness(decidedNext), ...queue] : queue;
};
