import { useState } from "react";

import { cn } from "@/lib/utils";
import { convertUTCDateToLocalDate } from "@/utils/TimeUtils";
import useBlockchainSyncInfo from "@/hooks/common/useBlockchainSyncInfo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface SyncInfoProps {
  className?: string;
}

export const getBlockDifference = (
  hiveBlockNumber: number | undefined,
  explorerBlockNumber: number | undefined
) => {
  const difference = (hiveBlockNumber || 0) - (explorerBlockNumber || 0);

  if (difference < 0) {
    return 0;
  } else {
    return difference;
  }
};

const SyncInfo: React.FC<SyncInfoProps> = ({ className }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    explorerBlockNumber,
    hiveBlockNumber,
    explorerTime,
    hiveBlockTime,
    loading: syncLoading,
  } = useBlockchainSyncInfo();

  const blockDifference = getBlockDifference(
    hiveBlockNumber,
    explorerBlockNumber
  );

  const differenceColorText =
    blockDifference > 20
      ? "text-explorer-red"
      : blockDifference > 3
      ? "text-explorer-orange"
      : "text-explorer-light-green";

  return !syncLoading ? (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => setDialogOpen(open)}
    >
      <DialogTrigger>
        <div
          className={cn(
            "flex flex-row gap-x-1 border rounded-[6px] mt-px mx-6 px-1.5 py-px text-sm cursor-pointer",
            {
              "border-explorer-light-green": blockDifference <= 10,
              "border-explorer-orange":
                blockDifference > 3 && blockDifference <= 20,
              "border-explorer-red": blockDifference > 20,
            },
            differenceColorText,
            className
          )}
          onClick={() => setDialogOpen(true)}
        >
          {blockDifference < 10 ? (
            <p className="text-explorer-light-green">
              Explorer synced with blockchain
            </p>
          ) : (
            <>
              <p>Blocks out of sync:</p>
              <p>{blockDifference.toLocaleString()}</p>
            </>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="bg-theme dark:bg-theme text-white">
        <DialogHeader>
          <DialogTitle>Blockchain sync</DialogTitle>
        </DialogHeader>
        <section className="flex flex-col">
          <div className="flex justify-between border-b py-1.5">
            <div>Blockchain headblock: </div>
            <div>{hiveBlockNumber?.toLocaleString()}</div>
          </div>
          <div className="flex justify-between border-b py-1.5">
            <div>Hafbe last block: </div>
            <div>{explorerBlockNumber?.toLocaleString()}</div>
          </div>
          <div
            className={cn(
              "flex justify-between border-b py-1.5",
              differenceColorText
            )}
          >
            <div>Block difference: </div>
            <div>{blockDifference.toLocaleString()} blocks</div>
          </div>
          <div
            className={cn("flex justify-between py-1.5", differenceColorText)}
          >
            <div>Last synced block at: </div>
            {explorerTime && (
              <div>{convertUTCDateToLocalDate(new Date(explorerTime))}</div>
            )}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  ) : (
    <div className="border rounded-[6px] mt-px mx-6 px-1.5 py-px text-sm border-explorer-yellow text-explorer-yellow">
      Connecting...
    </div>
  );
};

export default SyncInfo;
