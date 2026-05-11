import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useVoterProposals from "@/hooks/api/proposals/useVoterProposals";
import { useI18n } from "@/i18n/i18n";
import { cn, formatNumber } from "@/lib/utils";
import fetchingService from "@/services/FetchingService";
import { convertVestsToHP } from "@/utils/Calculations";
import { grabNumericValue } from "@/utils/StringUtils";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp } from "lucide-react";

interface ImpactSimulatorProps {
  proposalId: number;
  proposalHp: string | null | undefined;
  fundingThresholdVests: number | null;
  status: "active" | "inactive" | "expired";
}

const ImpactSimulator: React.FC<ImpactSimulatorProps> = ({
  proposalId,
  proposalHp,
  fundingThresholdVests,
  status,
}) => {
  const { username, isLoggedIn } = useAuth();
  const { t } = useI18n();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();
  const { votedProposalIds } = useVoterProposals(username ?? "");

  const { data: findAccountData, isLoading: isAccountLoading, isError: isAccountError } = useQuery({
    queryKey: ["findAccount", username],
    queryFn: () => fetchingService.findAccounts([username ?? ""]),
    enabled: !!username && isLoggedIn,
    refetchOnWindowFocus: false,
  });

  if (!isLoggedIn || status === "expired") return null;

  if (isAccountError) return null;
  if (isAccountLoading || !findAccountData?.accounts?.[0] || !dynamicGlobalData || !hiveChain || !proposalHp) {
    return <div className="h-4" />;
  }

  const account = findAccountData.accounts[0] as any;
  const hasProxy = (account.proxy || "") !== "";
  if (hasProxy) return null;

  const directVests = grabNumericValue(account.vesting_shares?.amount ?? "0");
  const totalProxiedVests =
    Array.isArray(account.proxied_vsf_votes) && account.proxied_vsf_votes.length > 0
      ? account.proxied_vsf_votes.reduce((sum: number, v: unknown) => sum + (Number(v) || 0), 0)
      : 0;
  const userEffectiveVests = directVests + totalProxiedVests;

  const { rawTotalVestingFundHive, rawTotalVestingShares } = dynamicGlobalData.headBlockDetails;
  const userHpStr = convertVestsToHP(hiveChain, String(userEffectiveVests), rawTotalVestingFundHive, rawTotalVestingShares) ?? "";
  const userHpNum = grabNumericValue(userHpStr);
  const userHpDisplayStr = `${formatNumber(userHpNum, false, true)} HP`;

  const isVoted = !!(votedProposalIds ?? []).includes(proposalId);
  const proposalHpNum = grabNumericValue(proposalHp);
  const simulatedHpNum = isVoted ? proposalHpNum - userHpNum : proposalHpNum + userHpNum;
  const simulatedHpStr = `${formatNumber(simulatedHpNum, false, true)} HP`;

  const fundingThresholdHp =
    fundingThresholdVests != null
      ? grabNumericValue(
          convertVestsToHP(hiveChain, String(fundingThresholdVests), rawTotalVestingFundHive, rawTotalVestingShares) ?? "0"
        )
      : null;
  const isFunded = fundingThresholdHp != null ? proposalHpNum > fundingThresholdHp : false;
  const wouldBeFunded = fundingThresholdHp != null ? simulatedHpNum > fundingThresholdHp : false;
  const wouldBecomeFunded = !isVoted && !isFunded && wouldBeFunded;
  const wouldBeUnfunded = isVoted && isFunded && !wouldBeFunded;

  const Icon = isVoted ? TrendingDown : TrendingUp;
  const sign = isVoted ? "−" : "+";
  const actionLabel = isVoted ? t("impactSimulator.ifUnvoted") : t("impactSimulator.ifVoted");
  const hoverIconColor = isVoted
    ? "group-hover/impact:text-amber-500 dark:group-hover/impact:text-amber-400"
    : "group-hover/impact:text-green-500 dark:group-hover/impact:text-green-400";
  const hoverTextColor = isVoted
    ? "group-hover/impact:text-amber-600 dark:group-hover/impact:text-amber-400"
    : "group-hover/impact:text-green-600 dark:group-hover/impact:text-green-400";

  return (
    <div className="group/impact flex items-center gap-1 text-xs cursor-default select-none min-h-[18px]">
      <Icon className={cn("h-3.5 w-3.5 flex-shrink-0 transition-colors duration-150 text-slate-300 dark:text-slate-600", hoverIconColor)} />
      <span className={cn("transition-colors duration-150 text-slate-300 dark:text-slate-600", hoverTextColor)}>
        {actionLabel}&nbsp;<span className="font-medium">{sign}{userHpDisplayStr}</span>
      </span>
      <span className="overflow-hidden max-w-0 group-hover/impact:max-w-xs transition-all duration-200 whitespace-nowrap text-slate-500 dark:text-slate-400">
        &nbsp;→&nbsp;{simulatedHpStr}&nbsp;total
        {wouldBecomeFunded && <span className="text-green-500 dark:text-green-400 font-semibold">&nbsp;·&nbsp;{t("impactSimulator.wouldFund")}</span>}
        {wouldBeUnfunded && <span className="text-amber-500 dark:text-amber-400 font-semibold">&nbsp;·&nbsp;{t("impactSimulator.wouldUnfund")}</span>}
      </span>
    </div>
  );
};

export default ImpactSimulator;
