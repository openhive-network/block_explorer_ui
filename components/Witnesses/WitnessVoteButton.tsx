import React, { useMemo, useState } from "react";
import { Loader2, Vote, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { SmartSigner } from "@/lib/smart-signer";
import { LoginMethod } from "@/lib/smart-signer/types";
import { buildWitnessVoteSignUrl } from "@/lib/smart-signer/providers/hivesigner";
import useWitnessVoteChain from "@/hooks/api/common/useWitnessVoteChain";
import { useI18n } from "@/i18n/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WitnessVoteButtonProps {
  witnessName: string;
  /**
   * pill   — bordered rounded-full, used in profile action strip
   * compact — filled rounded, used in witnesses table
   */
  variant?: "pill" | "compact";
  /** Called after a successful vote/unvote so the parent can update filter state */
  onVoteChange?: (witnessName: string, voted: boolean) => void;
}

const WitnessVoteButton: React.FC<WitnessVoteButtonProps> = ({
  witnessName,
  variant = "compact",
  onVoteChange,
}) => {
  const { t } = useI18n();
  const { username, method, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const { witnessVotes, proxyChain, isLoading } = useWitnessVoteChain(
    isLoggedIn ? (username || "") : ""
  );

  const [localOverride, setLocalOverride] = useState<boolean | null>(null);
  const [inProgress, setInProgress] = useState(false);

  const hasVoted = useMemo(() => {
    if (localOverride !== null) return localOverride;
    return witnessVotes.includes(witnessName);
  }, [localOverride, witnessVotes, witnessName]);

  const disabledReason = proxyChain.length > 0
    ? t("witnesses.voteTooltipProxy")
    : (!hasVoted && witnessVotes.length >= 30)
      ? t("witnesses.voteTooltipLimit")
      : null;

  const isDisabled = !!disabledReason || inProgress || isLoading;

  const handleToggle = async () => {
    if (!username || !method) return;
    const approve = !hasVoted;

    // Hivesigner cannot broadcast Active-key operations via its API.
    // Redirect to the Hivesigner sign page instead (same pattern as proposal voting).
    if (method === 'hivesigner') {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      window.location.href = buildWitnessVoteSignUrl(username, witnessName, approve, redirectUri);
      return;
    }

    setInProgress(true);
    try {
      await SmartSigner.broadcast(
        username,
        method as LoginMethod,
        [["account_witness_vote", { account: username, witness: witnessName, approve }]],
        "Active"
      );
      setLocalOverride(approve);
      onVoteChange?.(witnessName, approve);
      // Optimistically update the cache so other pages see the correct state immediately
      queryClient.setQueryData(
        ["witnessVoteChain", username],
        (old: { witnessVotes: string[]; proxyChain: string[] } | undefined) => {
          if (!old) return old;
          const newVotes = approve
            ? [...old.witnessVotes, witnessName]
            : old.witnessVotes.filter((w) => w !== witnessName);
          return { ...old, witnessVotes: newVotes };
        }
      );
      // Delay refetch to allow blockchain to propagate the transaction
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["witnessVoteChain", username] });
      }, 6000);
      toast.success(
        approve
          ? t("witnesses.voteSuccess", { witness: witnessName })
          : t("witnesses.unvoteSuccess", { witness: witnessName })
      );
    } catch {
      toast.error(t("witnesses.voteError"));
    } finally {
      setInProgress(false);
    }
  };

  if (!isLoggedIn) return null;

  const label = hasVoted ? t("witnesses.unvote") : t("witnesses.vote");

  if (variant === "pill") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <button
                disabled={isDisabled}
                onClick={handleToggle}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95",
                  hasVoted
                    ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50 dark:hover:bg-red-900/40"
                    : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50 dark:hover:bg-green-900/40",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {inProgress ? <Loader2 size={12} className="animate-spin" /> : <Vote size={13} />}
                {label}
              </button>
            </span>
          </TooltipTrigger>
          {disabledReason && <TooltipContent>{disabledReason}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    );
  }

  // compact variant (witnesses table) — icon-only button to save horizontal space
  const tooltipText = disabledReason || label;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <button
              disabled={isDisabled}
              onClick={handleToggle}
              aria-label={label}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded transition-colors",
                hasVoted
                  ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {inProgress ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : hasVoted ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <Vote className="h-3.5 w-3.5" />
              )}
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WitnessVoteButton;
