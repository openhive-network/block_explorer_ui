import React from "react";
import { Gift, Loader2 } from "lucide-react";

import useClaimRewards from "@/hooks/api/common/useClaimRewards";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

// Claims the signed-in account's pending rewards. Renders nothing when there
// is nothing to claim; callers decide whose page it belongs on.
const ClaimRewardsButton = ({ className }: { className?: string }) => {
  const { t } = useI18n();
  const { canClaim, isClaiming, claim } = useClaimRewards();

  if (!canClaim && !isClaiming) return null;

  return (
    <button
      type="button"
      onClick={claim}
      disabled={isClaiming}
      aria-busy={isClaiming}
      data-testid="claim-rewards-button"
      className={cn(
        "inline-flex min-h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-all hover:bg-amber-100 active:scale-95 disabled:cursor-wait disabled:opacity-70 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40",
        className
      )}
    >
      {isClaiming ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Gift className="h-3 w-3" />
      )}
      {isClaiming ? t("auth.claimingRewards") : t("auth.claimRewards")}
    </button>
  );
};

export default ClaimRewardsButton;
