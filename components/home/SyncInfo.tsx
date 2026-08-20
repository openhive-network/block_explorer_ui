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
import {
  Tooltip,
  TooltipTrigger,
  TooltipProvider,
  TooltipContent,
} from "../ui/hybrid-tooltip";
import {
  AlertCircle,
  Box,
  Boxes,
  Clock,
  RefreshCcw,
  RefreshCwOff,
} from "lucide-react";
import { useI18n } from "@/i18n/i18n";

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
  const { t, locale } = useI18n();
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
    blockDifference > 20 ? "red" : blockDifference > 3 ? "orange" : "green";

  return !syncLoading ? (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild={true} style={{ width: "32px" }}>
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
                    <RefreshCcw color={iconColor} size={18} strokeWidth={2} />
                  </TooltipTrigger>
                  <TooltipContent className="bg-theme text-text">
                    {t("syncInfo.explorerSynced")}
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
                        {blockDifference.toLocaleString(locale)}{" "}
                        {t("syncInfo.blocksOutOfSync")}
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
                  {blockDifference > 999
                    ? "999+"
                    : blockDifference.toLocaleString(locale)}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-sm p-5">
        <DialogHeader className="text-start sm:text-start">
          <DialogTitle className="text-base font-semibold">
            {t("syncInfo.blockchainSync")}
          </DialogTitle>
        </DialogHeader>

        {/* Lead with the verdict: the numbers below are the supporting detail. */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
            blockDifference > 20
              ? "bg-red-500/10"
              : blockDifference > 3
                ? "bg-orange-500/10"
                : "bg-green-500/10",
            differenceColorText
          )}
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-current" />
          {blockDifference === 0
            ? t("syncInfo.explorerSynced")
            : `${blockDifference.toLocaleString(locale)} ${t(
                "syncInfo.blocksOutOfSync"
              )}`}
        </div>

        <dl className="divide-y divide-gray-200 text-sm dark:divide-gray-700">
          {[
            {
              icon: <Boxes size={15} />,
              label: t("syncInfo.blockchainHeadblock"),
              value: hiveBlockNumber?.toLocaleString(locale),
            },
            {
              icon: <Box size={15} />,
              label: t("syncInfo.hafbeLastBlock"),
              value: explorerBlockNumber?.toLocaleString(locale),
            },
            {
              icon: <AlertCircle size={15} />,
              label: t("syncInfo.blockDifference"),
              value: `${blockDifference.toLocaleString(locale)} ${t(
                "syncInfo.blocks"
              )}`,
              accent: true,
            },
            {
              icon: <Clock size={15} />,
              label: t("syncInfo.lastSyncedBlock"),
              value: explorerTime
                ? convertUTCDateToLocalDate(new Date(explorerTime))
                : undefined,
              accent: true,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 py-2"
            >
              <dt className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                {row.icon}
                <span>{row.label}:</span>
              </dt>
              <dd
                className={cn(
                  "text-end font-medium tabular-nums",
                  row.accent && differenceColorText
                )}
              >
                {row.value ?? "-"}
              </dd>
            </div>
          ))}
        </dl>
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
            {t("syncInfo.connecting")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SyncInfo;
