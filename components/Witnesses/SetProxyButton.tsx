import React, { useState } from "react";
import { Loader2, UserCheck, UserX, UserCog } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { SmartSigner } from "@/lib/smart-signer";
import { LoginMethod } from "@/lib/smart-signer/types";
import { buildProxySignUrl } from "@/lib/smart-signer/providers/hivesigner";
import useWitnessVoteChain from "@/hooks/api/common/useWitnessVoteChain";
import { useI18n } from "@/i18n/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SetProxyButtonProps {
  witnessName: string;
  /**
   * pill   — bordered rounded-full, used in profile action strip
   * compact — filled rounded, used in witnesses table / banners
   */
  variant?: "pill" | "compact";
}

const SetProxyButton: React.FC<SetProxyButtonProps> = ({
  witnessName,
  variant = "compact",
}) => {
  const { t } = useI18n();
  const { username, method, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const { witnessVotes, proxyChain, isLoading } = useWitnessVoteChain(
    isLoggedIn ? username || "" : ""
  );

  const [inProgress, setInProgress] = useState(false);

  if (!isLoggedIn) return null;

  const currentProxy = proxyChain[0] ?? "";
  const isThisProxy = currentProxy === witnessName;
  const isOtherProxy = !!currentProxy && currentProxy !== witnessName;

  const handleClick = async () => {
    if (!username || !method) return;
    const proxyValue = isThisProxy ? "" : witnessName;

    // Hivesigner cannot broadcast Active-key operations via its API.
    // Redirect to the Hivesigner sign page (same pattern as WitnessVoteButton).
    if (method === "hivesigner") {
      const redirectUri = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      window.location.href = buildProxySignUrl(username, proxyValue, redirectUri);
      return;
    }

    setInProgress(true);
    try {
      await SmartSigner.broadcast(
        username,
        method as LoginMethod,
        [["account_witness_proxy", { account: username, proxy: proxyValue }]],
        "Active"
      );
      queryClient.setQueryData(
        ["witnessVoteChain", username],
        (
          old:
            | { witnessVotes: string[]; proxyChain: string[] }
            | undefined
        ) => {
          if (!old) return old;
          return {
            ...old,
            proxyChain: proxyValue ? [proxyValue] : [],
          };
        }
      );
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["witnessVoteChain", username],
        });
      }, 6000);
      toast.success(
        proxyValue
          ? t("witnesses.proxySuccess", { proxy: proxyValue })
          : t("witnesses.removeProxySuccess")
      );
    } catch {
      toast.error(t("witnesses.proxyError"));
    } finally {
      setInProgress(false);
    }
  };

  const isDisabled = inProgress || isLoading;
  const buttonLabel = isThisProxy
    ? t("witnesses.removeProxy")
    : isOtherProxy
    ? t("witnesses.replaceProxy")
    : t("witnesses.setProxy");

  // Override-warning tooltip text: shown when this click would overwrite manual votes
  // or an existing proxy. The actual confirmation happens in Keychain's popup or
  // on the Hivesigner sign page, so we only need to surface the warning here.
  const warningText = !isThisProxy
    ? (witnessVotes.length > 0
        ? t("witnesses.proxyConfirmBody", {
            witness: witnessName,
            votes: witnessVotes.length,
          })
        : t("witnesses.proxyConfirmBodyNoVotes", { witness: witnessName }))
    : null;
  const replaceText = isOtherProxy
    ? t("witnesses.proxyReplaceBody", { current: currentProxy })
    : null;

  const tooltipContent =
    warningText || replaceText ? (
      <>
        {warningText && <p className="max-w-xs text-xs">{warningText}</p>}
        {replaceText && (
          <p className="max-w-xs text-xs mt-1 font-medium">{replaceText}</p>
        )}
      </>
    ) : (
      buttonLabel
    );

  if (variant === "pill") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <button
                disabled={isDisabled}
                onClick={handleClick}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95",
                  isThisProxy
                    ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
                    : isOtherProxy
                    ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
                    : "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {inProgress ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <UserCheck size={13} />
                )}
                {buttonLabel}
              </button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // compact variant (witnesses table / banner) — icon-only to save space
  const CompactIcon = isThisProxy ? UserX : isOtherProxy ? UserCog : UserCheck;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <button
              disabled={isDisabled}
              onClick={handleClick}
              aria-label={buttonLabel}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded transition-colors",
                isThisProxy
                  ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  : isOtherProxy
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {inProgress ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CompactIcon className="h-3.5 w-3.5" />
              )}
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SetProxyButton;
