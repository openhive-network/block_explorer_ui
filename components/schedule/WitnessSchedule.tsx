import React, { useState, useEffect } from "react";
import { Loader2, Check, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import PageTitle from "../PageTitle";


export interface Witness {
  producerRank: number | null;
  producerName: string;
  blockNumber: number;
}

interface WitnessScheduleProps {
  data: Witness[];
  currentProducer: string | undefined;
  currentBlock: number | undefined;
  nextShuffleBlockNumber: number | string;
  blocksLeftBeforeRefetch: number | string;
}

const WitnessSchedule: React.FC<WitnessScheduleProps> = ({
  data,
  currentProducer,
  currentBlock,
  nextShuffleBlockNumber,
  blocksLeftBeforeRefetch,
}) => {
  const isCurrentProducer = (producerName: string) =>
    producerName === currentProducer;
  const [producedBlocks, setProducedBlocks] = useState<number[]>([]);
  useEffect(() => {
    if (
      currentBlock !== undefined &&
      currentBlock !== null &&
      !producedBlocks.includes(currentBlock)
    ) {
      setProducedBlocks((prevBlocks) => [...prevBlocks, currentBlock]);
    }
  }, [currentBlock, producedBlocks]);

  return (
    <div className="bg-theme rounded-xl shadow-lg w-full p-4">
      {/* Title and Next Shuffle Container */}
      <div className="mb-3">
        <PageTitle title="Witness Schedule" />

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Next Shuffle: {nextShuffleBlockNumber}{" "}
          <span className="text-green-500">
            ({blocksLeftBeforeRefetch} blocks left)
          </span>
        </p>
      </div>

      {/* Block Production Timeline List */}
      <div className="flex flex-col items-stretch justify-start space-y-1">
        {data.map((witness, index) => {
          const isCurrent = isCurrentProducer(witness.producerName);
          const blockHasBeenProduced =
            witness.blockNumber !== null &&
            witness.blockNumber !== undefined &&
            producedBlocks.includes(witness.blockNumber);

          return (
            <div
              key={witness.blockNumber}
              className={`relative w-full grid grid-cols-[1fr_2fr_1fr] items-center p-1 ${
                isCurrent
                  ? "bg-green-500 text-white"
                  : blockHasBeenProduced
                  ? "bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                  : "bg-rowHover"
              } shadow-sm text-xs`}
            >
              <div className="font-semibold justify-self-start">
                #{witness.producerRank != null ? witness.producerRank : "-"}
              </div>
              <div className="justify-self-start flex items-center gap-1">
                {witness.producerName}
                {witness.producerRank && witness.producerRank > 20 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ShieldCheck color="orange" strokeWidth={3} size={14} />
                      </TooltipTrigger>
                      <TooltipContent className="bg-theme text-text border-0">
                        <p>Backup Witness</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  ""
                )}
              </div>
              {witness.blockNumber !== null &&
              witness.blockNumber !== undefined ? (
                <div className="justify-self-end flex items-center space-x-1">
                  {isCurrent ? (
                    <Loader2
                      className="animate-spin dark:text-white"
                      size={14}
                    />
                  ) : blockHasBeenProduced ? (
                    <Check size={14} color="green" strokeWidth={4} />
                  ) : null}
                  <span>Block #{witness.blockNumber}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Next Shuffle Information (Moved Below List) */}
      <div className="text-center mt-4">
        <p className="text-gray-600 dark:text-gray-400">
          Next Shuffle: {nextShuffleBlockNumber} ({blocksLeftBeforeRefetch}{" "}
          blocks left)
        </p>
      </div>
    </div>
  );
};

export default WitnessSchedule;