import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import SignInPromptButton from "@/components/login/SignInPromptButton";

interface ProposalWatchButtonProps {
  proposalId: number;
}

const ProposalWatchButton: React.FC<ProposalWatchButtonProps> = ({
  proposalId,
}) => {
  const { isLoggedIn } = useAuth();
  const { isWatched, toggleWatch } = useWatchlist();
  const { t } = useI18n();

  if (!isLoggedIn) {
    return (
      <SignInPromptButton
        variant="icon"
        colorClassName="border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-amber-600 dark:hover:text-amber-400"
        icon={Star}
        signInLabel={t("auth.signIn")}
        tooltip={t("auth.unlock.watchProposal")}
      />
    );
  }

  const watched = isWatched("proposals", proposalId);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => toggleWatch("proposals", proposalId)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all duration-200",
            watched
              ? "border-amber-400 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
              : "border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-amber-600 dark:hover:text-amber-400"
          )}
          aria-label={t(
            watched
              ? "watchlist.removeFromWatchlist"
              : "watchlist.addToWatchlist"
          )}
        >
          <Star className={cn("h-5 w-5", watched && "fill-amber-400")} />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {t(
            watched
              ? "watchlist.removeFromWatchlist"
              : "watchlist.addToWatchlist"
          )}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ProposalWatchButton;
