import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronUp, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import {
  computeProducerShare,
  countMissedByProducer,
  producerBarScale,
  DEFAULT_TOP_PRODUCERS,
  OTHER_PRODUCER_KEY,
} from "@/utils/producerShare";
import { useI18n } from "@/i18n/i18n";

interface ProducerShareCardProps {
  rows: { producer_account: string }[];
  missedProducersByBlock?: Record<number, string[]>;
  className?: string;
}

const ProducerShareCard: React.FC<ProducerShareCardProps> = ({
  rows,
  missedProducersByBlock = {},
  className,
}) => {
  const { t, locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const missedByProducer = useMemo(
    () => countMissedByProducer(missedProducersByBlock),
    [missedProducersByBlock]
  );
  const share = useMemo(
    () => computeProducerShare(rows, DEFAULT_TOP_PRODUCERS, missedByProducer),
    [rows, missedByProducer]
  );
  const distinctProducers = useMemo(
    () => new Set(rows.map((row) => row.producer_account).filter(Boolean)).size,
    [rows]
  );

  if (!share.length) return null;

  const widest = producerBarScale(share);

  return (
    <div className={cn(className)} data-testid="producer-share">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 text-xs font-medium text-explorer-light-gray dark:text-gray-300">
          <Users size={14} />
          {t("blocksPage.producerShare.title")}
          <span className="text-explorer-dark-gray dark:text-white">
            {t("blocksPage.producerShare.summary", {
              count: distinctProducers.toLocaleString(locale),
            })}
          </span>
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen ? (
        <ul className="mt-3 flex flex-col gap-1.5">
          {share.map((entry) => (
            <li
              key={entry.producer}
              // Status gutter; Other is an aggregate, so it carries neither colour.
              className={cn(
                "grid grid-cols-[minmax(6rem,9rem)_1fr_auto] items-center gap-2 text-[11px]",
                !entry.isOther && "border-s-2 ps-1.5",
                !entry.isOther &&
                  (entry.missed > 0
                    ? "border-amber-500/60"
                    : "border-emerald-500/60")
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                {entry.isOther ? (
                  <span className="h-4 w-4 flex-shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                ) : (
                  <Image
                    src={getHiveAvatarUrl(entry.producer)}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 flex-shrink-0 rounded-full"
                    unoptimized
                  />
                )}
                {entry.isOther ? (
                  <span className="truncate text-explorer-light-gray">
                    {t("blocksPage.producerShare.other")}
                  </span>
                ) : (
                  <Link
                    href={`/@${entry.producer}`}
                    className="truncate text-link"
                  >
                    {entry.producer}
                  </Link>
                )}
              </span>

              <span className="flex h-2 w-full items-center">
                <span
                  className={cn(
                    "block h-full rounded-e-full",
                    entry.isOther
                      ? "bg-slate-400 dark:bg-slate-500"
                      : "bg-indigo-500"
                  )}
                  style={{ width: `${(entry.blocks / widest) * 100}%` }}
                />
              </span>

              <span className="flex items-center gap-2 whitespace-nowrap tabular-nums text-explorer-light-gray dark:text-gray-300">
                <span>
                  {entry.blocks.toLocaleString(locale)}
                  <span className="ms-1 text-explorer-dark-gray dark:text-white">
                    {entry.percentage}%
                  </span>
                </span>
                <span
                  className={cn(
                    "inline-flex min-w-[3.5rem] items-center justify-end gap-1",
                    entry.missed
                      ? "font-medium text-amber-600 dark:text-amber-400"
                      : "text-explorer-light-gray/60"
                  )}
                >
                  {entry.missed ? <AlertTriangle size={11} /> : null}
                  {t("blocksPage.producerShare.missedCount", {
                    count: entry.missed.toLocaleString(locale),
                  })}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default ProducerShareCard;
