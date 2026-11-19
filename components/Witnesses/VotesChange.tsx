import React from "react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import Hive from "@/types/Hive";
import useBlockData from "@/hooks/api/blockPage/useBlockData";
import { parseChainDate } from "@/utils/TimeUtils";

export const VOTES_CHANGE_WINDOWS = ["today", "7d"] as const;
export type VotesChangeWindowKey = (typeof VOTES_CHANGE_WINDOWS)[number];

export const VOTES_CHANGE_CAUSES = [
  "votes_cast",
  "votes_removed",
  "power_down",
  "power_up",
  "producer_reward",
  "claimed_reward",
  "proxy",
  "expired",
  "declined",
] as const;

export type VotesChangeCause = (typeof VOTES_CHANGE_CAUSES)[number];
// What the change badges show and the change sorts order by.
export type VotesChangeSelection = "total" | VotesChangeCause;
export const VOTES_CHANGE_SELECTIONS: readonly VotesChangeSelection[] = [
  "total",
  ...VOTES_CHANGE_CAUSES,
];

// Causes that can only lower a witness's votes: sorting by them puts the
// biggest loss first.
export const LOSS_CAUSES: VotesChangeSelection[] = [
  "votes_removed",
  "power_down",
  "expired",
  "declined",
];

export const causeLabelKey = (cause: VotesChangeSelection) =>
  `witnesses.votesChangeCause.${cause}`;

export const WINDOW_LABEL_KEY: Record<VotesChangeWindowKey, string> = {
  today: "witnesses.windowToday",
  "7d": "witnesses.window7Days",
};

export const hasVotesChangeBreakdown = (witnesses: any[] | undefined) =>
  !!witnesses?.some((w) => w?.votes_change_breakdown);

export const getVotesChange = (
  witness: any,
  window: VotesChangeWindowKey,
  selection: VotesChangeSelection
): string | undefined =>
  (
    witness?.votes_change_breakdown as Hive.WitnessVotesChangeBreakdown | null
  )?.[window]?.[selection];

// The breakdown's total covers every cause. votes_daily_change only adds up
// the vote and unvote rows, so it misses weight changes and proxy moves.
export const todayVotesChange = (witness: any): string =>
  String(
    (witness?.votes_change_breakdown as Hive.WitnessVotesChangeBreakdown | null)
      ?.today?.total ??
      witness?.votes_daily_change ??
      "0"
  );

// The CSV's votes change columns. With the breakdown, its per-cause columns
// replace the old change columns; a witness the node has not refreshed yet
// keeps its old figure under All causes (Today), as the table shows it.
export const votesChangeExportColumns = (
  witness: any,
  showVotesChange: boolean,
  t: (key: string) => string,
  hp: (vests: string) => string,
  vests: (vests: string) => string
): Record<string, string> => {
  if (!showVotesChange) {
    const change = String(witness?.votes_daily_change ?? "0");
    return {
      [t("witnesses.votesChange")]: hp(change),
      [t("common.vestsChange")]: vests(change),
    };
  }
  return Object.fromEntries(
    VOTES_CHANGE_WINDOWS.flatMap((window) =>
      VOTES_CHANGE_SELECTIONS.map((cause) => [
        `${t(causeLabelKey(cause))} (${t(WINDOW_LABEL_KEY[window])})`,
        witness?.votes_change_breakdown
          ? hp(getVotesChange(witness, window, cause) ?? "0")
          : window === "today" && cause === "total"
            ? hp(todayVotesChange(witness))
            : "",
      ])
    )
  );
};

const signClass = (value: number) =>
  value > 0
    ? "text-green-600 dark:text-green-400"
    : value < 0
      ? "text-red-600 dark:text-red-400"
      : "text-gray-600 dark:text-gray-300";

// wax's formatter misplaces the decimal point of a negative amount
// (-2,628.815 HP comes out as -2,628.85), so amounts are converted without
// their sign and the sign is put back here.
export const splitVestsSign = (vests: string | number) => {
  const text = String(vests ?? "0");
  const value = Number(text);
  return {
    sign: value > 0 ? "+" : value < 0 ? "-" : "",
    abs: text.replace(/^-/, ""),
  };
};

export const signedHp = (
  vests: string,
  toHp: (vests: string) => React.ReactNode
) => {
  const { sign, abs } = splitVestsSign(vests);
  return (
    <>
      {sign}
      {toHp(abs)}
    </>
  );
};

interface VotesChangeBadgeProps {
  window: VotesChangeWindowKey;
  breakdown: Hive.WitnessVotesChangeBreakdown;
  selection: VotesChangeSelection;
  toHp: (vests: string) => React.ReactNode;
}

// One window's change, as a badge like the missed-blocks ones, with the cause
// breakdown on hover (a tap popover on touch screens).
export const VotesChangeBadge: React.FC<VotesChangeBadgeProps> = ({
  window,
  breakdown,
  selection,
  toHp,
}) => {
  const { t, locale } = useI18n();
  const data = breakdown[window];
  if (!data) return null;
  const shown = Number(data[selection] ?? 0);
  const causes = VOTES_CHANGE_CAUSES.filter((c) => Number(data[c] ?? 0) !== 0);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-baseline gap-1 rounded px-1.5 py-0.5 leading-none cursor-help",
            shown > 0
              ? "bg-green-500/10"
              : shown < 0
                ? "bg-red-500/10 dark:bg-red-500/15"
                : "bg-gray-500/10"
          )}
          data-testid={`votes-change-${window}`}
        >
          <span className="text-[10px] opacity-75">
            {t(WINDOW_LABEL_KEY[window])}
          </span>
          <span
            className={cn(
              "text-xs font-semibold tabular-nums whitespace-nowrap",
              signClass(shown)
            )}
          >
            {shown === 0 ? "0" : signedHp(String(data[selection]), toHp)}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent className="bg-theme text-text text-xs max-w-xs">
          <p className="font-semibold mb-1">
            {t(
              window === "today"
                ? "witnesses.votesChangeTitleToday"
                : "witnesses.votesChangeTitle7d"
            )}
          </p>
          {causes.length === 0 ? (
            <p>{t("witnesses.votesChangeNone")}</p>
          ) : (
            <table className="w-full">
              <tbody>
                {causes.map((cause) => {
                  const value = Number(data[cause]);
                  return (
                    <tr
                      key={cause}
                      className={cn(cause === selection && "font-semibold")}
                    >
                      <td className="pe-3">{t(causeLabelKey(cause))}</td>
                      <td
                        className={cn(
                          "text-end tabular-nums whitespace-nowrap",
                          signClass(value)
                        )}
                      >
                        {signedHp(data[cause], toHp)}
                      </td>
                    </tr>
                  );
                })}
                <tr
                  className={cn(
                    "border-t border-gray-500/30",
                    selection === "total" && "font-semibold"
                  )}
                >
                  <td className="pe-3 pt-0.5">
                    {t("witnesses.votesChangeCause.total")}
                  </td>
                  <td
                    className={cn(
                      "text-end tabular-nums whitespace-nowrap pt-0.5",
                      signClass(Number(data.total))
                    )}
                  >
                    {signedHp(data.total, toHp)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          {data.voters > 0 && (
            <p className="mt-1 opacity-75">
              {t("witnesses.votesChangeVoters", {
                count: data.voters.toLocaleString(locale),
              })}
            </p>
          )}
          {/* The votes history lists proxy, expiry and declined-rights drops as
              plain removals, even when a proxy move nets to 0 here. */}
          {data.voters > 0 && (
            <p className="mt-1 opacity-75" data-testid="votes-change-drops">
              {t("witnesses.votesChangeDropsNote")}
            </p>
          )}
          <p className="mt-1 opacity-75">
            {t("witnesses.votesChangeDelegations")}
          </p>
          <VotesChangeAsOf block={breakdown.as_of_block} />
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
};

// "HH:mm UTC" for a time today (UTC), with the date otherwise.
export const formatAsOfTime = (date: Date, now: Date = new Date()): string => {
  const iso = date.toISOString();
  const time = `${iso.slice(11, 16)} UTC`;
  return iso.slice(0, 10) === now.toISOString().slice(0, 10)
    ? time
    : `${iso.slice(0, 10).replaceAll("-", "/")} ${time}`;
};

// When the breakdown was computed. The block's time is looked up when the
// tooltip opens (every witness shares the block, so it is fetched once): a
// block number alone doesn't show that votes newer than it are not counted yet.
const VotesChangeAsOf: React.FC<{ block: number }> = ({ block }) => {
  const { t, locale } = useI18n();
  const { blockDetails } = useBlockData(block);
  const date = parseChainDate(blockDetails?.created_at);
  const blockText = block?.toLocaleString(locale);
  return (
    <p className="opacity-75" data-testid="votes-change-as-of">
      {date
        ? t("witnesses.votesChangeAsOfTime", {
            time: formatAsOfTime(date),
            block: blockText,
          })
        : t("witnesses.votesChangeAsOf", { block: blockText })}
    </p>
  );
};

interface RankMoveProps {
  rank: number;
  breakdown: Hive.WitnessVotesChangeBreakdown;
  window: VotesChangeWindowKey;
}

// The witness's rank movement over the window, from the rank at its start.
export const RankMove: React.FC<RankMoveProps> = ({
  rank,
  breakdown,
  window,
}) => {
  const { t, locale } = useI18n();
  const data = breakdown[window];
  // A witness whose votes did not move has no rank of its own to compare:
  // the backend ranks ties together (haf_block_explorer#206).
  if (!data || !rank || !data.rank_start || Number(data.total) === 0)
    return null;
  const move = data.rank_start - rank;
  if (move === 0) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-[10px] font-normal tabular-nums cursor-help whitespace-nowrap",
            move > 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          )}
          data-testid="rank-move"
          aria-label={t(
            move > 0 ? "witnesses.rankMoveUp" : "witnesses.rankMoveDown",
            { count: Math.abs(move).toLocaleString(locale) }
          )}
        >
          <span aria-hidden="true">
            {move > 0 ? "▲" : "▼"}
            {Math.abs(move).toLocaleString(locale)}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent className="bg-theme text-text text-xs">
          {t("witnesses.rankMoveTooltip", {
            window: t(WINDOW_LABEL_KEY[window]),
            start: data.rank_start.toLocaleString(locale),
            now: rank.toLocaleString(locale),
          })}
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
};
