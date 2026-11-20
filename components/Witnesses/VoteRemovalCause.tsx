import Link from "next/link";

import Hive from "@/types/Hive";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import useWitnessVoteChain from "@/hooks/api/common/useWitnessVoteChain";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";

type Translate = ReturnType<typeof useI18n>["t"];
type RemovalCause = Exclude<Hive.WitnessVoteCause, "votes_cast">;

const CHIP_CLASS: Record<RemovalCause, string> = {
  votes_removed: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  proxy:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  expired:
    "bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600",
  declined:
    "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
};

// The reason a removal row lost its vote; null for approvals, for nodes that
// don't send a cause yet, and for causes this UI doesn't know.
export const removalCause = (
  vote: Hive.WitnessVotesHistory
): RemovalCause | null => {
  if (vote.approve) return null;
  const cause = vote.cause;
  return cause && Object.hasOwn(CHIP_CLASS, cause)
    ? (cause as RemovalCause)
    : null;
};

// The CSV export's Vote column: the reason where there is one.
export const voteExportLabel = (
  vote: Hive.WitnessVotesHistory,
  t: Translate
): string => {
  if (vote.approve) return t("votesHistoryDialog.approve");
  const cause = removalCause(vote);
  if (!cause) return t("votesHistoryDialog.disapprove");
  const label = t(`votesHistoryDialog.cause.${cause}`);
  return cause === "proxy" && vote.proxy_name
    ? `${label} → ${vote.proxy_name}`
    : label;
};

// Mounted only while the tooltip is open, so the voter's proxy chain is
// fetched on hover, not once per row.
const ProxyStillCounts = ({
  voter,
  proxy,
  witness,
}: {
  voter: string;
  proxy: string;
  witness: string;
}) => {
  const { t } = useI18n();
  const { witnessVotes, proxyChain } = useWitnessVoteChain(voter);
  // Only while the voter still uses this proxy and the proxy itself votes for
  // the witness: if the proxy has a proxy too, "{{proxy}} votes for" is untrue.
  const stillCounts =
    proxyChain.length === 1 &&
    proxyChain[0] === proxy &&
    witnessVotes.includes(witness);
  if (!stillCounts) return null;
  return (
    <p className="mt-1" data-testid="vote-cause-proxy-still-counts">
      {t("votesHistoryDialog.causeTooltip.proxyStillCounts", {
        voter,
        proxy,
        witness,
      })}
    </p>
  );
};

const VoteRemovalCause = ({
  vote,
  witness,
}: {
  vote: Hive.WitnessVotesHistory;
  witness: string;
}) => {
  const { t } = useI18n();
  const cause = removalCause(vote);
  if (!cause) return null;
  const proxy = cause === "proxy" ? vote.proxy_name : null;

  // The button opens the explanation (keyboard and touch too); the proxy's
  // link sits next to it in the chip, outside the tooltip trigger.
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold",
        CHIP_CLASS[cause]
      )}
      data-testid="vote-cause-chip"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="cursor-help">
            {t(`votesHistoryDialog.cause.${cause}`)}
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent className="max-w-xs bg-theme text-text text-xs text-left">
            <p>{t(`votesHistoryDialog.causeTooltip.${cause}`)}</p>
            {proxy && (
              <ProxyStillCounts
                voter={vote.voter_name}
                proxy={proxy}
                witness={witness}
              />
            )}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
      {proxy && (
        <>
          {/* U+2192 doesn't mirror in right-to-left text, so flip it there. */}
          <span className="mx-1 inline-block rtl:rotate-180" aria-hidden>
            →
          </span>
          <Link
            href={`/@${proxy}`}
            className="underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {proxy}
          </Link>
        </>
      )}
    </span>
  );
};

export default VoteRemovalCause;
