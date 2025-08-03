import { useState, useMemo } from "react";
import Head from "next/head";
import { useI18n } from "@/i18n/i18n";
import useProposals from "@/hooks/api/proposals/useProposals";

import {
  ProposalControls,
  ProposalStatusFilter,
  ProposalSortOrder,
} from "@/components/proposals/ProposalControls";
import {
  ProposalCard,
  ProposalCardSkeleton,
  ReturnProposalCard,
} from "@/components/proposals/ProposalCard";
import ErrorMessage from "@/components/ErrorMessage";
import NoResult from "@/components/NoResult";
import PageTitle from "@/components/PageTitle";
import { ProposalAnalytics } from "@/components/proposals/analytics/ProposalAnalytics";

const ProposalsPage = () => {
  const { t } = useI18n();
  const [statusFilter, setStatusFilter] =
    useState<ProposalStatusFilter>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] =
    useState<ProposalSortOrder>("by_total_votes");


  const apiStatus = statusFilter === "inactive" ? "all" : statusFilter;

  const { proposalsData, isProposalsLoading, isProposalsError } = useProposals({
    status: apiStatus,
    orderBy: sortOrder,
  });

  const { returnProposal, enrichedProposals, fundingThreshold } =
    useMemo(() => {
      if (!proposalsData || proposalsData.length === 0) {
        return {
          returnProposal: null,
          enrichedProposals: [],
          fundingThreshold: 0,
        };
      }

      const rawReturnProposal = proposalsData.find((p) => p.proposal_id === 0);
      const threshold = rawReturnProposal
        ? parseFloat(rawReturnProposal.total_votes)
        : 0;

      const now = new Date();

      const allEnriched = proposalsData.map((proposal) => {
        let status: "active" | "expired" | "inactive";

        if (now < proposal.start_date) {
          status = "inactive";
        } else if (now > proposal.end_date) {
          status = "expired";
        } else {
          status = "active";
        }

        return {
          ...proposal,
          status: status,
          isFunded: parseFloat(proposal.total_votes) > threshold,
        };
      });

      return {
        returnProposal: allEnriched.find((p) => p.proposal_id === 0) || null,
        enrichedProposals: allEnriched.filter((p) => p.proposal_id !== 0),
        fundingThreshold: threshold,
      };
    }, [proposalsData]);

  const searchedProposals = useMemo(() => {
    const statusFilteredProposals =
      statusFilter === "inactive"
        ? enrichedProposals.filter((p) => p.status === "inactive")
        : enrichedProposals;

    return statusFilteredProposals.filter((proposal) => {
      if (searchQuery.length > 2) {
        const lowerQuery = searchQuery.toLowerCase();
        return (
          proposal.subject.toLowerCase().includes(lowerQuery) ||
          proposal.creator.toLowerCase().includes(lowerQuery)
        );
      }
      return true;
    });
  }, [enrichedProposals, searchQuery, statusFilter]); 

  const fundedProposals = useMemo(() => {
    return searchedProposals.filter((p) => p.isFunded);
  }, [searchedProposals]);

  const unfundedProposals = useMemo(() => {
    return searchedProposals.filter((p) => !p.isFunded);
  }, [searchedProposals]);

  const renderContent = () => {
    if (isProposalsError)
      return <ErrorMessage message={t("proposalsPage.errorMessage")} />;
    if (isProposalsLoading)
      return (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProposalCardSkeleton key={`initial-load-${i}`} />
          ))}
        </div>
      );
    if (
      fundedProposals.length === 0 &&
      unfundedProposals.length === 0 &&
      !returnProposal
    )
      return <NoResult descriptionKey={t("proposalsPage.noResults")} />;

    const shouldShowReturnProposal =
      returnProposal && (statusFilter === "active" || statusFilter === "all");
    const hasAnyFundedContent =
      fundedProposals.length > 0 || shouldShowReturnProposal;
    const hasUnfundedContent = unfundedProposals.length > 0;

    return (
      <>
        {fundedProposals.length > 0 && (
          <div className="flex flex-col gap-4">
            {fundedProposals.map((proposal) => (
              <ProposalCard key={proposal.proposal_id} proposal={proposal} />
            ))}
          </div>
        )}

        {shouldShowReturnProposal && (
          <div className={fundedProposals.length > 0 ? "mt-4" : ""}>
            <ReturnProposalCard proposal={returnProposal} />
          </div>
        )}

        {hasAnyFundedContent && hasUnfundedContent && (
          <div
            className="flex items-center text-center my-10"
            aria-hidden="true"
          >
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
            <span className="flex-shrink mx-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("proposalsPage.unfundedSeparatorTitle")}
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
          </div>
        )}

        {hasUnfundedContent && (
          <div className="flex flex-col gap-4">
            {unfundedProposals.map((proposal) => (
              <ProposalCard
                key={proposal.proposal_id}
                proposal={proposal}
                fundingThreshold={fundingThreshold}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Head>
        <title>{t("pageTitle.proposals")}</title>
      </Head>
      <div className="page-container">
        <PageTitle 
          titleKey="pageTitle.proposals" 
          className="py-4 px-2" 
        />
        <div className="mt-4">
          <ProposalAnalytics />
        </div>

        <div className="mt-8">
          <ProposalControls
            currentStatus={statusFilter}
            onStatusChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
        </div>
        <main className="mt-8">{renderContent()}</main>
      </div>
    </>
  );
};

export default ProposalsPage;