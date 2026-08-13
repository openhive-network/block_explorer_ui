import React, { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Vote } from "lucide-react";
import { Card } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import WidgetUnavailable from "@/components/dashboard/ui/WidgetUnavailable";
import { useAuth } from "@/contexts/AuthContext";
import useProposals from "@/hooks/api/proposals/useProposals";
import useVoterProposals from "@/hooks/api/proposals/useVoterProposals";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

const MyProposalVotesWidget: React.FC = () => {
  const { t, dir } = useI18n();
  const { isLoggedIn, username } = useAuth();

  const {
    votedProposalIds,
    isLoading: isVotesLoading,
    isError: isVotesError,
  } = useVoterProposals(isLoggedIn && username ? username : "");
  const { proposalsData, isProposalsLoading, isProposalsError } = useProposals({
    status: "active",
    orderBy: "by_total_votes",
    enabled: !!(isLoggedIn && username),
  });

  const voted = useMemo(() => {
    if (!votedProposalIds?.length || !proposalsData) return [];
    const ids = new Set(votedProposalIds);
    return proposalsData.filter(
      // The return proposal is a mechanism, not a vote.
      (proposal) => ids.has(proposal.proposal_id) && proposal.proposal_id !== 0
    );
  }, [votedProposalIds, proposalsData]);

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Vote}
        message={t("widgets.myProposalVotesLoggedOut")}
      />
    );
  }

  if (isVotesError || isProposalsError) return <WidgetUnavailable />;

  const isLoading = isVotesLoading || isProposalsLoading;

  return (
    <Card className="col-span-12 lg:col-span-3 mb-2 flex h-full flex-col overflow-hidden">
      <CardHeaderWithLink
        className="flex-shrink-0"
        href={`/proposals?voter=${username}&status=all`}
        title={
          <span className="flex items-center gap-2">
            <span className="truncate">{t("widgets.myProposalVotesName")}</span>
            {voted.length > 0 && (
              <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {voted.length}
              </span>
            )}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto p-1.5">
        {isLoading ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : voted.length === 0 ? (
          <p className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("widgets.myProposalVotesEmpty")}
          </p>
        ) : (
          <ul>
            {voted.map((proposal) => (
              <li key={proposal.proposal_id}>
                <Link
                  href={`/proposal/@${proposal.creator}/${proposal.permlink}`}
                  className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-gray-900 dark:text-white">
                      {proposal.subject}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-gray-400 dark:text-gray-500">
                      #{proposal.proposal_id} · {proposal.daily_pay}
                    </span>
                  </span>
                  <ChevronRight
                    size={14}
                    className={cn(
                      "shrink-0 text-gray-300 dark:text-gray-600",
                      dir === "rtl" && "rotate-180"
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default MyProposalVotesWidget;
