import React from "react";
import Link from "next/link";
import { Users, Handshake } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import SetProxyButton from "./SetProxyButton";

interface VoterFilterBannerProps {
  voter: string;
  isOwnView: boolean;
  proxyChain: string[];
  voteCount: number;
  isCountLoading: boolean;
  onClearFilter?: () => void;
}

const VoterFilterBanner: React.FC<VoterFilterBannerProps> = ({
  voter,
  isOwnView,
  proxyChain,
  voteCount,
  isCountLoading,
  onClearFilter,
}) => {
  const { t } = useI18n();
  const hasProxy = proxyChain.length > 0;

  if (!onClearFilter && !hasProxy) return null;

  const colorClass = hasProxy
    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-200"
    : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-200";

  const proxyMessage = (
    <span>
      <Link href={`/@${voter}`} className="font-semibold hover:underline">
        @{voter}
      </Link>
      <span> {t("accountWitnessVotesCard.uses")} </span>
      {proxyChain.map((p, i) => (
        <span key={p}>
          <Link href={`/@${p}`} className="font-semibold hover:underline">
            @{p}
          </Link>
          {i < proxyChain.length - 1 && (
            <span>, {t("accountWitnessVotesCard.whoUses")} </span>
          )}
        </span>
      ))}
      <span> {t("accountWitnessVotesCard.asVotingProxy")}</span>
    </span>
  );

  const noProxyMessage = (
    <span>
      {t("witnesses.myVotesBanner", { voter })}
      {!isCountLoading && ` (${voteCount}/30)`}
    </span>
  );

  return (
    <div
      className={cn(
        "mb-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm",
        colorClass
      )}
    >
      <div className="flex items-start gap-2 min-w-0">
        {hasProxy && (
          <Handshake className="h-4 w-4 flex-shrink-0 mt-0.5" />
        )}
        {hasProxy ? proxyMessage : noProxyMessage}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {hasProxy && isOwnView && (
          <SetProxyButton witnessName={proxyChain[0]} variant="compact" />
        )}
        {onClearFilter && (
          <button
            onClick={onClearFilter}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap",
              hasProxy
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            {t("witnesses.showAllWitnesses")}
          </button>
        )}
      </div>
    </div>
  );
};

export default VoterFilterBanner;
