import React, { useEffect, useState } from "react";
import { Ban, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompareRow as Row, Side } from "@/utils/compare/types";
import { winnerOf, deltaRatio, sparkScale } from "@/utils/compare/scoring";
import { compareCellPair, compareSecondaryText } from "@/utils/compare/format";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// @a = red, @b = blue (matches the demo). Colors go on bare spans — a merged
// class list drops them (tailwind-merge).
export const SIDE_TEXT: Record<Side, string> = {
  a: "text-red-600 dark:text-red-400",
  b: "text-blue-600 dark:text-blue-400",
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

// The caret points at its own side, so it mirrors under RTL.
const CARET = "text-[9px] leading-none rtl:-scale-x-100";

const StackedBars: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  // Grow from 0 to the target width once on mount (skipped under reduced motion
  // via the motion-reduce variant, which forces the final width with no transition).
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const fill =
    "h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:!transition-none";
  return (
    <div aria-hidden className="flex w-16 flex-shrink-0 flex-col gap-1 sm:w-24">
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
        <div
          className={cn(fill, "bg-red-500")}
          style={{ width: grown ? `${clamp(a) * 100}%` : "0%" }}
        />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
        <div
          className={cn(fill, "bg-blue-500")}
          style={{ width: grown ? `${clamp(b) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
};

interface ValProps {
  side: Side;
  row: Row;
  text: string;
  isWinner: boolean;
  locale: string;
}

const Val: React.FC<ValProps> = ({ side, row, text, isWinner, locale }) => {
  const secondary = compareSecondaryText(row, side, locale);

  return (
    <div
      aria-hidden
      className={cn(
        "flex min-w-0 flex-1 items-center gap-1 text-sm tabular-nums sm:min-w-[84px] sm:flex-none",
        side === "a" ? "justify-end text-end" : "justify-start text-start",
        isWinner
          ? "font-bold"
          : "font-semibold text-slate-700 dark:text-slate-100"
      )}
    >
      {isWinner && side === "b" && (
        <span className={cn(CARET, "text-blue-500")}>◂</span>
      )}
      <span className="min-w-0 break-words">
        <span className={cn("block", isWinner && SIDE_TEXT[side])}>{text}</span>
        {secondary && (
          <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {secondary}
          </span>
        )}
      </span>
      {isWinner && side === "a" && (
        <span className={cn(CARET, "text-red-500")}>▸</span>
      )}
    </div>
  );
};

interface CompareRowProps {
  row: Row;
  aAccount: string;
  bAccount: string;
  locale: string;
  t: (k: string) => string;
}

const CompareRowView: React.FC<CompareRowProps> = ({
  row,
  aAccount,
  bAccount,
  locale,
  t,
}) => {
  const winner = winnerOf(row);
  const { a: aText, b: bText } = compareCellPair(row, locale, t);
  // Ratios and bars only mean something for magnitudes — not dates, and not the
  // bucket ranks behind a categorical row.
  const ratioable = row.format !== "date" && row.format !== "text";
  const delta = ratioable ? deltaRatio(row) : null;
  const barMax = Math.max(Math.abs(row.aValue ?? 0), Math.abs(row.bValue ?? 0));
  const spark = ratioable && barMax > 0 ? sparkScale(row) : { a: 0, b: 0 };

  const deltaColor =
    winner === "a"
      ? SIDE_TEXT.a
      : winner === "b"
        ? SIDE_TEXT.b
        : "text-slate-400 dark:text-slate-500";

  const deltaText = delta === "tie" ? t("compare.tie") : (delta ?? "");

  // Carets, colour and bars carry the result visually; this is the same row in
  // words, for screen readers.
  const leader =
    winner === "a" ? `@${aAccount}` : winner === "b" ? `@${bAccount}` : null;
  // Shown for reference but excluded from the Score (e.g. delegated-out, account
  // age, RC delegations) — flagged with a marker + tooltip.
  const isNeutral = !row.scored && !row.unavailable;
  const spoken = row.unavailable
    ? `${t(row.labelKey)}: ${t("compare.unavailable")}`
    : [
        `${t(row.labelKey)}.`,
        `@${aAccount}: ${aText}.`,
        `@${bAccount}: ${bText}.`,
        leader
          ? `${t("compare.score")}: ${leader}.`
          : isNeutral
            ? `${t("compare.notScored")}.`
            : "",
        row.infoKey ? t(row.infoKey) : "",
      ]
        .join(" ")
        .trim();

  return (
    <div
      className={cn(
        // Phones stack label+delta over the value duel; sm+ is one flex row.
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 border-b border-slate-100 px-3 py-2.5 last:border-b-0 dark:border-slate-800",
        "sm:flex sm:gap-3 sm:px-4"
      )}
    >
      <span className="sr-only">{spoken}</span>

      <div aria-hidden className="min-w-0 sm:order-1 sm:flex-1">
        <div className="flex min-w-0 items-start gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
            {t(row.labelKey)}
          </span>
          {isNeutral && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-shrink-0 cursor-help text-slate-300 dark:text-slate-600">
                    <Ban className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[200px] text-[11px]"
                >
                  {t("compare.notScored")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {row.infoKey && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-shrink-0 cursor-help text-slate-300 dark:text-slate-600">
                    <Info className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[220px] text-[11px]"
                >
                  {t(row.infoKey)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {row.subLabelKey && (
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            {t(row.subLabelKey)}
          </div>
        )}
      </div>

      <div
        aria-hidden
        className={cn(
          "text-end text-[11px] font-semibold tabular-nums",
          row.unavailable && "hidden sm:block",
          "sm:order-3 sm:min-w-0 sm:flex-1",
          deltaColor
        )}
      >
        {deltaText}
      </div>

      {row.unavailable ? (
        <div
          aria-hidden
          className="flex items-center justify-end sm:order-2 sm:w-[280px] sm:flex-shrink-0 sm:justify-center"
        >
          <span className="text-xs italic text-slate-400 dark:text-slate-500">
            {t("compare.unavailable")}
          </span>
        </div>
      ) : (
        <div className="col-span-2 flex items-center gap-2 sm:order-2 sm:col-span-1 sm:flex-shrink-0">
          <Val
            side="a"
            row={row}
            text={aText}
            isWinner={winner === "a"}
            locale={locale}
          />
          <StackedBars a={spark.a} b={spark.b} />
          <Val
            side="b"
            row={row}
            text={bText}
            isWinner={winner === "b"}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
};

export default CompareRowView;
