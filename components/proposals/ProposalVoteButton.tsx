import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useProposalVote from "@/hooks/api/proposals/useProposalVote";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { Heart, Loader2 } from "lucide-react";

interface ProposalVoteButtonProps {
  proposalId: number;
  status: "active" | "inactive" | "expired";
}

const ProposalVoteButton: React.FC<ProposalVoteButtonProps> = ({ proposalId, status }) => {
  const { t } = useI18n();
  const { isVoted, isVoting, error, vote, isLoggedIn } = useProposalVote(proposalId);

  if (!isLoggedIn) return null;

  if (status === "expired") {
    if (!isVoted) return null;
    return (
      <div className="flex h-9 items-center gap-1.5 rounded-lg border-2 px-3 text-sm font-semibold border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-default select-none opacity-70">
        <Heart className="h-4 w-4 fill-slate-400 dark:fill-slate-500" />
        <span>{t("proposalCard.voted")}</span>
      </div>
    );
  }

  const handleVote = async () => {
    await vote(!isVoted);
    setTimeout(() => {
      document.getElementById(`proposal-${proposalId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleVote}
          disabled={isVoting}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-lg border-2 px-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
            error
              ? "border-orange-300 bg-orange-50 text-orange-500 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
              : isVoted
              ? "border-red-400 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              : "border-slate-200 bg-white text-slate-500 hover:border-red-300 hover:text-red-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-red-600 dark:hover:text-red-400"
          )}
          aria-label={isVoted ? t("proposalCard.unvote") : t("proposalCard.vote")}
        >
          {isVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={cn("h-4 w-4", isVoted && !error && "fill-red-500 dark:fill-red-400")} />
          )}
          <span>{isVoted ? t("proposalCard.voted") : t("proposalCard.vote")}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-center">
        <p>{error ?? (isVoted ? t("proposalCard.unvote") : t("proposalCard.vote"))}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ProposalVoteButton;
