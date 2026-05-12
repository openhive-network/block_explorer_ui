import React from "react";
import { Users, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import SetProxyButton from "./SetProxyButton";

interface VoterFilterBannerProps {
  voter: string;
  isOwnView: boolean;
  proxyChain: string[];
  voteCount: number;
  isCountLoading: boolean;
  /** When set, renders a "Show all witnesses" pill that clears the voter filter */
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
  const { t, dir } = useI18n();
  const hasProxy = proxyChain.length > 0;
  const isRtl = dir === "rtl";

  // Nothing to surface — no filter and no proxy
  if (!onClearFilter && !hasProxy) return null;

  const message = hasProxy
    ? isOwnView
      ? t("witnesses.proxyBanner", { proxy: proxyChain.join(" → @") })
      : t("witnesses.myVotesBannerProxy", {
          voter,
          proxy: proxyChain.join(" → @"),
        })
    : `${t("witnesses.myVotesBanner", { voter })}${
        !isCountLoading ? ` (${voteCount}/30)` : ""
      }`;

  const colorClass = hasProxy
    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-200"
    : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-200";

  return (
    <div
      className={cn(
        "mb-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm",
        colorClass
      )}
    >
      <span>{message}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        {hasProxy && isOwnView && (
          <SetProxyButton witnessName={proxyChain[0]} variant="compact" />
        )}
        {onClearFilter && (
          <button
            onClick={onClearFilter}
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:shadow-sm",
              hasProxy
                ? "bg-white/70 border-amber-300 hover:bg-white dark:bg-slate-900/40 dark:border-amber-800/40 dark:hover:bg-slate-900/70"
                : "bg-white/70 border-blue-300 hover:bg-white dark:bg-slate-900/40 dark:border-blue-800/40 dark:hover:bg-slate-900/70"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">
              {t("witnesses.showAllWitnesses")}
            </span>
            <ArrowRight
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                isRtl
                  ? "rotate-180 group-hover:-translate-x-0.5"
                  : "group-hover:translate-x-0.5"
              )}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default VoterFilterBanner;
