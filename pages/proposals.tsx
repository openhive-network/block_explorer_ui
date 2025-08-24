import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useI18n } from "@/i18n/i18n";
import useProposals from "@/hooks/api/proposals/useProposals";
import useVoterProposals from "@/hooks/api/proposals/useVoterProposals";
import {
  ProposalControls,
  ProposalStatusFilter,
  ProposalSortOrder,
  ProposalSortDirection,
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
import ScrollTopButton from "@/components/ScrollTopButton";
import { formatNumber } from "@/lib/utils";
import useGetAccounts from "@/hooks/api/proposals/useGetAccounts";
import { grabNumericValue } from "@/utils/StringUtils";
import { BudgetsSection } from "@/components/proposals/BudgetsSection";
import useDebounce from "@/hooks/common/useDebounce";

const ProposalsPage = () => {
  const { t } = useI18n();
  const router = useRouter();

  const [statusFilter, setStatusFilter] =
    useState<ProposalStatusFilter>("active");
  const [sortOrder, setSortOrder] =
    useState<ProposalSortOrder>("by_total_votes");
  const [sortDirection, setSortDirection] =
    useState<ProposalSortDirection>("descending");

  // This state holds the search input's value and updates instantly for a responsive UI.
  const [searchQuery, setSearchQuery] = useState(
    (router.query.q as string) || ""
  );

  // Effect to sync state FROM the URL on initial load or browser navigation (back/forward).
  useEffect(() => {
    const query = (router.query.q as string) || "";
    if (query !== searchQuery) {
      setSearchQuery(query);
    }
    if (query) {
      setStatusFilter("all");
    } else {
      setStatusFilter("active");
    }

  }, [router.query.q]);

  // Create a debounced function that will update the URL.
  // This is the core of the performance fix.
  const debouncedUpdateUrl = useDebounce((query: string) => {
    const { pathname, query: routerQuery } = router;
    const newQuery = { ...routerQuery };

    if (query) {
      newQuery.q = query;
    } else {
      delete newQuery.q;
    }

    // Only push to router if the query has actually changed to avoid unnecessary re-renders.
    if (newQuery.q !== (routerQuery.q || undefined)) {
      router.push({ pathname, query: newQuery }, undefined, { shallow: true });
    }
  }, 500); // 500ms delay after user stops typing.

  // The handler passed to the search input.
  // It updates the local state instantly and calls the debounced function.
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedUpdateUrl(query);
  };

  const { accountsData } = useGetAccounts(["hive.fund"]) as any;
  const totalBudgetNumber = grabNumericValue(
    accountsData?.[0].hbd_balance ?? ""
  );
  const dailyBudgetNumber = totalBudgetNumber / 100;
  const apiStatus = statusFilter === "inactive" ? "all" : statusFilter;

  const { proposalsData, isProposalsLoading, isProposalsError } = useProposals({
    status: apiStatus,
    orderBy: sortOrder,
    direction: sortDirection,
  });

  // The API call for voter data is now driven directly by the URL parameter,
  // which is our debounced source of truth.
  const { votedProposalIds, isLoading: isVoterListLoading } =
    useVoterProposals((router.query.q as string) || "");

  const { proposalsData: proposalsDataForBudget } = useProposals({
    status: "all",
    orderBy: "by_total_votes",
    direction: "descending",
  });

  const { dailyFunded } = useMemo(() => {
    if (!proposalsDataForBudget || proposalsDataForBudget.length === 0) {
      return { dailyFunded: 0 };
    }
    const now = new Date();
    const ordered = [...proposalsDataForBudget].sort(
      (a, b) => parseFloat(b.total_votes) - parseFloat(a.total_votes)
    );
    const idxReturn = ordered.findIndex((p) => p.proposal_id === 0);
    const aboveReturn =
      idxReturn === -1 ? ordered : ordered.slice(0, idxReturn);
    const activeOnly = aboveReturn.filter(
      (p) => now >= p.start_date && now <= p.end_date
    );
    let sum = 0;
    for (const p of activeOnly) {
      const dp = grabNumericValue(p.daily_pay) as number;
      if (sum + dp <= dailyBudgetNumber) sum += dp;
      else break;
    }
    return { dailyFunded: sum };
  }, [dailyBudgetNumber, proposalsDataForBudget]);

  const { returnProposal, enrichedProposals, fundingThreshold } = useMemo(() => {
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
      if (now < proposal.start_date) status = "inactive";
      else if (now > proposal.end_date) status = "expired";
      else status = "active";
      return {
        ...proposal,
        status,
        isFunded: parseFloat(proposal.total_votes) > threshold,
      };
    });
    return {
      returnProposal: allEnriched.find((p) => p.proposal_id === 0) || null,
      enrichedProposals: allEnriched.filter((p) => p.proposal_id !== 0),
      fundingThreshold: threshold,
    };
  }, [proposalsData]);

  // The main filtering logic is also driven by the debounced URL parameter.
  const searchedProposals = useMemo(() => {
    const statusFilteredProposals =
      statusFilter === "inactive"
        ? enrichedProposals.filter((p) => p.status === "inactive")
        : enrichedProposals;

    const currentQuery = (router.query.q as string) || "";
    if (currentQuery.length > 2) {
      const lowerQuery = currentQuery.toLowerCase();
      const votedIdsSet = new Set(votedProposalIds || []);

      const combinedResults = statusFilteredProposals.filter((proposal) => {
        const textMatch =
          proposal.subject.toLowerCase().includes(lowerQuery) ||
          proposal.creator.toLowerCase().includes(lowerQuery);
        const voterMatch = votedIdsSet.has(proposal.proposal_id);
        return textMatch || voterMatch;
      });
      const uniqueResults = new Map();
      combinedResults.forEach((proposal) =>
        uniqueResults.set(proposal.proposal_id, proposal)
      );
      return Array.from(uniqueResults.values());
    }

    return statusFilteredProposals;
  }, [
    enrichedProposals,
    statusFilter,
    router.query.q,
    votedProposalIds,
  ]);

  const fundedProposals = useMemo(() => {
    return searchedProposals.filter((p) => p.isFunded);
  }, [searchedProposals]);

  const unfundedProposals = useMemo(() => {
    return searchedProposals.filter((p) => !p.isFunded);
  }, [searchedProposals]);
  
  const renderContent = () => {
    if (isProposalsError)
      return <ErrorMessage message={t("proposalsPage.errorMessage")} />;
    
    const currentQuery = (router.query.q as string) || "";
    const isLoading =
      isProposalsLoading ||
      (currentQuery.length > 2 && isVoterListLoading);
    if (isLoading)
      return (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProposalCardSkeleton key={`loading-${i}`} />
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
          <div className="flex items-center text-center my-10" aria-hidden="true">
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
  const totalBudgetHBD = formatNumber(totalBudgetNumber ?? 0, false, true);
  const dailyBudgetHBD = formatNumber(dailyBudgetNumber ?? 0, false, true);
  const dailyFundedHBD = formatNumber(dailyFunded ?? 0, false, true);
  const budgets = [
    { key: "daily_funded", label: t("proposalControls.dailyFunded"), value: `${dailyFundedHBD} HBD` },
    { key: "daily_budget", label: t("proposalControls.dailyBudget"), value: `${dailyBudgetHBD} HBD` },
    { key: "total_budget", label: t("proposalControls.totalBudget"), value: `${totalBudgetHBD} HBD` },
  ];

  return (
    <>
      <Head>
        <title>{t("pageTitle.proposals")}</title>
      </Head>
      <div className="page-container">
        <PageTitle titleKey="pageTitle.proposals" className="py-4 px-2" />
        <div className="mt-4">
          <BudgetsSection budgets={budgets} />
        </div>
        <div className="mt-4">
          <ProposalAnalytics />
        </div>
        <div className="mt-8">
          <ProposalControls
            currentStatus={statusFilter}
            onStatusChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearch={handleSearchChange}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
          />
        </div>
        <main className="mt-8">{renderContent()}</main>
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </>
  );
};

export default ProposalsPage;