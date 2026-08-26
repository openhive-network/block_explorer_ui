import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Check, ShieldCheck, Star, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/hybrid-tooltip";
import PageTitle from "../PageTitle";
import { useI18n } from "../../i18n/i18n";
import { cn } from "@/lib/utils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useWitnessVoteChain from "@/hooks/api/common/useWitnessVoteChain";
import useMissedProducers from "@/hooks/api/schedulePage/useMissedProducers";
import { currentRoundBlockRange } from "@/utils/witnessScheduleRound";
import { fillAttributionGaps } from "@/utils/witnessScheduleAttribution";
import { useAuth } from "@/contexts/AuthContext";

export interface Witness {
  producerRank: number | null;
  producerName: string;
  blockNumber: number | null;
}

interface WitnessScheduleProps {
  data: Witness[];
  currentProducerIndex: number;
  nextShuffleBlockNumber: number | string;
  blocksLeftBeforeRefetch: number | string;
}

const WitnessSchedule: React.FC<WitnessScheduleProps> = ({
  data,
  currentProducerIndex,
  nextShuffleBlockNumber,
  blocksLeftBeforeRefetch,
}) => {
  const { t, locale } = useI18n();
  const { username } = useAuth();
  const { witnessVotes } = useWitnessVoteChain(username ?? "");
  const votedFor = React.useMemo(() => new Set(witnessVotes), [witnessVotes]);

  // Misses come from the chain's own producer_missed_operation. An absent block
  // cannot stand in for it: the schedule's block attribution has holes, and a
  // hole looks identical to a skipped slot.
  const roundRange = React.useMemo(
    () =>
      currentRoundBlockRange(
        Number(nextShuffleBlockNumber),
        Number(blocksLeftBeforeRefetch),
        data.length
      ),
    [nextShuffleBlockNumber, blocksLeftBeforeRefetch, data.length]
  );
  const { missedProducers } = useMissedProducers(roundRange, data.length);
  const missed = React.useMemo(
    () => new Set(missedProducers),
    [missedProducers]
  );

  // The two block sources leave short-lived holes; anything the anchors settle
  // outright is credited rather than left blank for a few seconds.
  const scheduleRows = React.useMemo(
    () => fillAttributionGaps(data, missed),
    [data, missed]
  );

  return (
    <div className="bg-theme rounded-xl shadow-lg w-full p-4">
      <div className="mb-3">
        <PageTitle titleKey={t("witnessSchedule.title")} classic />

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("witnessSchedule.nextShuffle")}:{" "}
          {Number(nextShuffleBlockNumber).toLocaleString(locale)}{" "}
          <span className="text-green-500">
            ({Number(blocksLeftBeforeRefetch).toLocaleString(locale)}{" "}
            {t("witnessSchedule.blocksLeft")})
          </span>
        </p>
      </div>

      {/* Block Production Timeline List */}
      <div className="flex flex-col items-stretch justify-start space-y-1">
        {scheduleRows.map((witness, index) => {
          const isCurrent = index === currentProducerIndex;
          const hasHadItsTurn =
            currentProducerIndex >= 0 && index < currentProducerIndex;
          const isVoted = votedFor.has(witness.producerName);
          // Only a passed slot with nothing attributed to it, that the chain
          // also names as a miss.
          const isMissed =
            hasHadItsTurn &&
            witness.blockNumber === null &&
            missed.has(witness.producerName);

          return (
            <div
              key={witness.producerName}
              className={cn(
                "relative w-full grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1 p-1.5 shadow-sm text-xs rounded",
                isCurrent
                  ? "bg-green-500 text-white"
                  : isMissed
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
                    : hasHadItsTurn
                      ? "bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                      : "bg-rowHover"
              )}
            >
              <div className="font-semibold tabular-nums justify-self-start">
                #{witness.producerRank != null ? witness.producerRank : "-"}
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 justify-self-start">
                <Image
                  src={getHiveAvatarUrl(witness.producerName)}
                  alt={witness.producerName}
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                />
                <Link
                  href={`/@${witness.producerName}`}
                  className={cn(
                    "truncate hover:underline",
                    isCurrent ? "text-white" : "text-link"
                  )}
                >
                  {witness.producerName}
                </Link>

                {isVoted ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex shrink-0 items-center">
                          <Star
                            size={13}
                            className="fill-amber-400 text-amber-400"
                            aria-label={t("witnessSchedule.youVoteFor")}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-theme text-text border-0">
                        <p>{t("witnessSchedule.youVoteFor")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}

                {witness.producerRank && witness.producerRank > 20 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex shrink-0 items-center">
                          <ShieldCheck
                            color="orange"
                            strokeWidth={3}
                            size={14}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-theme text-text border-0">
                        <p>{t("witnessSchedule.backupWitness")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-1 justify-self-end">
                {isMissed ? (
                  <span className="flex items-center gap-1 font-semibold">
                    <AlertTriangle size={13} className="shrink-0" />
                    {t("witnessSchedule.missed")}
                  </span>
                ) : witness.blockNumber !== null ? (
                  <>
                    {isCurrent ? (
                      <Loader2
                        className="animate-spin dark:text-white"
                        size={14}
                      />
                    ) : hasHadItsTurn ? (
                      <Check size={14} color="green" strokeWidth={4} />
                    ) : null}
                    <Link
                      href={`/block/${witness.blockNumber}`}
                      className={cn(
                        "whitespace-nowrap tabular-nums hover:underline",
                        isCurrent ? "text-white" : "text-link"
                      )}
                    >
                      {t("witnessSchedule.block")} #
                      {witness.blockNumber.toLocaleString(locale)}
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WitnessSchedule;
