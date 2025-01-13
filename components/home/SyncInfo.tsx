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
import { Tooltip , TooltipTrigger , TooltipProvider ,TooltipContent } from "../ui/tooltip";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faCubes, faExclamationCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { RefreshCcw, RefreshCwOff } from "lucide-react";

interface SyncInfoProps {
  className?: string;
}

export const getBlockDifference = (
  hiveBlockNumber: number | undefined,
  explorerBlockNumber: number | undefined
) => {
  const difference = (hiveBlockNumber || 0) - (explorerBlockNumber || 0);
  return difference < 0 ? 0 : difference;
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

  const iconColor =
    blockDifference > 20
      ? "red"
      : blockDifference > 3
      ? "orange"
      : "green";
  
  return !syncLoading ? (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => setDialogOpen(open)}
    >
      <DialogTrigger asChild={true} style={{ width: "32px"}}>
        <div
          className={cn(
            "bg-navbar hover:bg-navbar-hover border rounded-[6px] py-px cursor-pointer",
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
          <div className=" h-[30px] w-[30px] relative p-1 flex items-center justify-center">
            {blockDifference < 10 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <RefreshCcw 
                      color={iconColor} 
                      size={18} 
                      strokeWidth={2} />
                  </TooltipTrigger>
                  <TooltipContent className="bg-theme text-text">
                    Explorer synced with blockchain
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="relative">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <RefreshCwOff
                        color={iconColor}
                        size={18}
                        strokeWidth={2}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-theme text-text">
                      <p>
                        {blockDifference.toLocaleString()} Blocks out of sync
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span
                className={cn(
                  "absolute top-[-17px] sm:top-[-17px] text-xs font-semibold text-white bg-red-600 rounded-full px-1 py-1 z-20",
                  {
                    "right-[-17px]": blockDifference >= 100,
                    "right-[-14px]": blockDifference < 100,
                  }
                )}
              >
                {blockDifference > 999 ? "999+" : blockDifference.toLocaleString()}
              </span>

              </div>
            )}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="dialog-content p-6 max-w-lg ">
        <DialogHeader className="dialog-header">
          <DialogTitle className="dialog-title">Blockchain Sync</DialogTitle>
        </DialogHeader>
        <section className="dialog-section">
          <div className="dialog-item">
            <div className="dialog-item-text">
              <FontAwesomeIcon icon={faCubes} className="text-sm" />
              <div>Blockchain Headblock:</div>
            </div>
            <div className="dialog-item-value">
              {hiveBlockNumber?.toLocaleString()}
            </div>
          </div>
          <div className="dialog-item">
            <div className="dialog-item-text">
              <FontAwesomeIcon icon={faCube} className="text-sm" />
              <div>Hafbe Last Block:</div>
            </div>
            <div className="dialog-item-value">
              {explorerBlockNumber?.toLocaleString()}
            </div>
          </div>
          <div className={cn("dialog-item", differenceColorText)}>
            <div className="dialog-item-text">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-sm" />
              <div>Block Difference:</div>
            </div>
            <div className="dialog-item-value">
              {blockDifference.toLocaleString()} blocks
            </div>
          </div>
          <div className={cn("dialog-item", differenceColorText)}>
            <div className="dialog-item-text">
              <FontAwesomeIcon icon={faClock} className="text-sm" />
              <div>Last Synced Block At:</div>
            </div>
            {explorerTime && (
              <div className="dialog-item-value">
                {convertUTCDateToLocalDate(new Date(explorerTime))}
              </div>
            )}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  ) : (
    <div
      className="h-[34px] w-[32px] bg-navbar hover:bg-navbar-hover items-center justify-center 
            flex flex-row border rounded-[6px] cursor-pointer border-explorer-orange text-explorer-orange"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <RefreshCcw
              color="orange"
              size={18}
              strokeWidth={2}
              style={{ animation: "spin 2s linear infinite" }}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-theme text-text">
            Connecting
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SyncInfo;
