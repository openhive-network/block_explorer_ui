import React, { useState, useEffect } from "react";
import { ArrowRightLeft, Box, Boxes } from "lucide-react";
import Link from "next/link";

import Hive from "@/types/Hive";
import HiveAvatar from "@/components/ui/HiveAvatar";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { useI18n } from "../../i18n/i18n";

interface CurrentBlockCardProps {
  blockDetails?: Hive.BlockDetails | null;
  transactionCount?: number;
  opcount?: number;
  liveBlockNumber?: number | null;
  timeDifferenceInSeconds?: number | null;
  isLive?: boolean;
}

interface Producer {
  href: string;
  name: string;
}

const trimBlockNumber = (blockNum: number | undefined, locale: string) => {
  if (!blockNum) return;

  return blockNum.toLocaleString(locale);
};

const CurrentBlockCard: React.FC<CurrentBlockCardProps> = ({
  blockDetails,
  transactionCount,
  opcount,
  liveBlockNumber,
  timeDifferenceInSeconds,
  isLive,
}) => {
  const { locale: appLocale, t } = useI18n();
  const [producer, setProducer] = useState<Producer | null>(null);
  useEffect(() => {
    if (blockDetails?.producer_account) {
      const href = `/@${blockDetails?.producer_account}`;
      const name = blockDetails?.producer_account;
      setProducer({ href, name });
    }
  }, [blockDetails?.producer_account]);
  return (
    <div
      className="data-box relative flex flex-col w-full"
      style={{ padding: "6px 8px", margin: "3px 0" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 border-b pb-0.5">
        <span className="text-base font-medium">
          {t("currentBlockCard.currentBlock")}
        </span>
        {isLive ? (
          typeof timeDifferenceInSeconds === "number" ? (
            <span className="text-explorer-red text-[11px] font-semibold whitespace-nowrap shrink-0">
              {timeDifferenceInSeconds} {t("currentBlockCard.secsAgo")}
            </span>
          ) : null
        ) : (
          <TimeAgo
            locale={appLocale}
            datetime={
              new Date(formatAndDelocalizeTime(blockDetails?.created_at))
            }
            className="text-explorer-red text-[11px] font-semibold whitespace-nowrap shrink-0"
          />
        )}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 mt-1">
        <div className="flex items-center gap-1 shrink-0">
          <Box size={14} className="shrink-0" />
          <Link
            href={`/block/${liveBlockNumber ?? blockDetails?.block_num}`}
            data-testid="block-number-link"
          >
            <span className="text-link text-base font-semibold">
              {liveBlockNumber
                ? trimBlockNumber(liveBlockNumber, appLocale)
                : trimBlockNumber(blockDetails?.block_num, appLocale)}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xs shrink-0">{t("common.by")}:</span>
          {producer && (
            <Link
              className="flex items-center gap-1 text-link min-w-0"
              href={producer.href}
              data-testid="current-witness-link"
            >
              <HiveAvatar
                className="border-2 border-link"
                accountName={producer.name}
                alt="avatar"
                size={22}
              />
              <span
                className="text-link text-xs font-semibold truncate"
                data-testid="current-witness-name"
              >
                {producer.name}
              </span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-1.5 text-xs">
        <span className="inline-flex items-center gap-1">
          <Boxes size={13} className="opacity-70" />
          <span className="font-semibold tabular-nums">
            {(opcount ?? 0).toLocaleString(appLocale)}
          </span>
          <span className="opacity-60">{t("common.operations")}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <ArrowRightLeft size={13} className="opacity-70" />
          <span className="font-semibold tabular-nums">
            {(transactionCount ?? 0).toLocaleString(appLocale)}
          </span>
          <span className="opacity-60">{t("common.transactions")}</span>
        </span>
      </div>
    </div>
  );
};

export default CurrentBlockCard;
