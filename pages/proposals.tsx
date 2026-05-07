import { useState, useMemo, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
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
import { HeartHandshake, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/contexts/WatchlistContext";
import useGetAccounts from "@/hooks/api/proposals/useGetAccounts";
import { grabNumericValue, isHiveAccountName } from "@/utils/StringUtils";
import { BudgetsSection } from "@/components/proposals/BudgetsSection";
import useDebounce from "@/hooks/common/useDebounce";
import useFindProposal from "@/hooks/api/proposals/useFindProposal";

export type MatchDetails = {
  isCreatorMatch: boolean;
  isVoterMatch: boolean;
  isTitleMatch: boolean;
};

const ProposalsPage = () => {
  const { t } = useI18n();
  const router = useRouter();

  const [statusFilter, setStatusFilter] =
    useState<ProposalStatusFilter>("active");
  const [sortOrder, setSortOrder] =
    useState<ProposalSortOrder>("by_total_votes");
  const [sortDirection, setSortDirection] =
    useState<ProposalSortDirection>("descending");
  const [searchQuery, setSearchQuery] = useState("");
  const [voterFilter, setVoterFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [votedOnly, setVotedOnly] = useState(false);
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);

  const { isLoggedIn, username } = useAuth();
  const queryClient = useQueryClient();
  const { getWatched } = useWatchlist();
  const watchedProposalIds = getWatched("proposals");

  useEffect(() => {
    if (!router.isReady) return;
    const queryStatus = router.query.status as ProposalStatusFilter;
    const queryId = router.query.ID as string;
    const querySearch = router.query.q as string;
    const queryVoter = router.query.voter as string;

    setVoterFilter(queryVoter || "");

    const newStatus = ['all', 'active', 'inactive', 'expired'].includes(queryStatus)
      ? queryStatus
      : (queryId || querySearch || queryVoter)
      ? "all"
      : "active";

    setStatusFilter(newStatus);
    setSearchQuery(queryId || querySearch || "");
  }, [router.isReady, router.query.status, router.query.ID, router.query.q, router.query.voter]);

  useEffect(() => {
    if (!router.isReady || !router.query.hs_voted) return;
    if (username) {
      queryClient.invalidateQueries(["voterProposals", username]);
    }
    // Capture hash before router.replace strips it
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('proposal-')) {
      setScrollTargetId(hash);
    }
    const { hs_voted: _, ...rest } = router.query;
    router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
  }, [router.isReady, router.query.hs_voted, username]);

  const debouncedUpdateUrl = useDebounce((query: string) => {
    const newQuery = { ...router.query };
    // Clear previous search parameters first
    delete newQuery.q;
    delete newQuery.ID;

    if (query) {
      const numericId = parseInt(query.trim(), 10);
      const isIdSearch = !isNaN(numericId) && numericId.toString() === query.trim();
      
      if (isIdSearch) {
        newQuery.ID = query;
      } else {
        newQuery.q = query;
      }
    }
    
    router.push({ pathname: router.pathname, query: newQuery }, undefined, {
      shallow: true,
    });
  }, 500);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedUpdateUrl(query);
  };
  
  const handleStatusChange = (status: ProposalStatusFilter) => {
    const newQuery = { ...router.query, status: status };
    router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  };
  
  const handleSortChange = (order: ProposalSortOrder) => setSortOrder(order);
  const handleSortDirectionChange = (direction: ProposalSortDirection) => setSortDirection(direction);

  const clearVoterFilter = useCallback(() => {
    const newQuery = { ...router.query };
    delete newQuery.voter;
    router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  }, [router]);

  const proposalIdSearch = useMemo(() => {
    const num = parseInt(searchQuery.trim(), 10);
    return !isNaN(num) && num.toString() === searchQuery.trim() ? num : null;
  }, [searchQuery]);

  const { accountsData } = useGetAccounts(["hive.fund"]) as any;

  const totalBudgetNumber = grabNumericValue(
    accountsData?.[0].hbd_balance ?? ""
  );

  const dailyBudgetNumber = totalBudgetNumber / 100;

  const apiStatus = statusFilter === "inactive" ? "all" : statusFilter;

  const { foundProposalData, isFindProposalLoading } = useFindProposal(proposalIdSearch);

  const { proposalsData, isProposalsLoading, isProposalsError } = useProposals({
    status: apiStatus,
    orderBy: sortOrder,
    direction: sortDirection,
    enabled: proposalIdSearch === null,
  });
  
  const proposalsToRender = proposalIdSearch !== null ? foundProposalData : proposalsData;

  useEffect(() => {
    if (!scrollTargetId || isProposalsLoading) return;
    const timer = setTimeout(() => {
      document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setScrollTargetId(null);
    }, 300);
    return () => clearTimeout(timer);
  }, [scrollTargetId, isProposalsLoading]);

  const voterSearchQuery = voterFilter || (isHiveAccountName(searchQuery) ? searchQuery : "");
  const { votedProposalIds, isLoading: isVoterListLoading } = useVoterProposals(voterSearchQuery);
  const { votedProposalIds: myVotedProposalIds, isLoading: isMyVotedLoading } = useVoterProposals(username ?? "");

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
    const ordered = [...proposalsDataForBudget].sort((a, b) => parseFloat(b.total_votes) - parseFloat(a.total_votes));
    const idxReturn = ordered.findIndex((p) => p.proposal_id === 0);
    const aboveReturn = idxReturn === -1 ? ordered : ordered.slice(0, idxReturn);
    const activeOnly = aboveReturn.filter((p) => now >= p.start_date && now <= p.end_date);
    let sum = 0;
    for (const p of activeOnly) {
      const dp = grabNumericValue(p.daily_pay) as number;
      if (sum + dp <= dailyBudgetNumber) sum += dp;
      else break;
    }
    return { dailyFunded: sum };
  }, [dailyBudgetNumber, proposalsDataForBudget]);

  const { enrichedProposals, fundingThreshold } = useMemo(() => {
    if (!proposalsToRender || proposalsToRender.length === 0) {
      return {
        enrichedProposals: [],
        fundingThreshold: 0,
      };
    }
    const rawReturnProposal = proposalsToRender.find((p) => p.proposal_id === 0);
    const threshold = rawReturnProposal ? parseFloat(rawReturnProposal.total_votes) : 0;
    const now = new Date();
    const allEnriched = proposalsToRender.map((proposal) => {
      let status: "active" | "expired" | "inactive";
      if (now < proposal.start_date) { status = "inactive"; } 
      else if (now > proposal.end_date) { status = "expired"; } 
      else { status = "active"; }
      return { ...proposal, status, isFunded: parseFloat(proposal.total_votes) > threshold };
    });
    return { enrichedProposals: allEnriched, fundingThreshold: threshold };
  }, [proposalsToRender]); // Dependency is now correct

  const searchedProposals = useMemo(() => {
    let result: (typeof enrichedProposals[0] & { matchDetails?: MatchDetails })[];

    if (proposalIdSearch !== null) {
      result = enrichedProposals.map((p) => ({ ...p, matchDetails: { isCreatorMatch: false, isVoterMatch: false, isTitleMatch: false } }));
    } else {
      const preFilteredProposals = enrichedProposals.filter(proposal => {
        if (statusFilter === 'all') return true;
        return proposal.status === statusFilter;
      });

      if (voterFilter) {
        const votedIdsSet = new Set(votedProposalIds || []);
        const voted = preFilteredProposals.filter(p => votedIdsSet.has(p.proposal_id));
        if (searchQuery.length < 3) {
          result = voted.map(p => ({ ...p, matchDetails: { isCreatorMatch: false, isVoterMatch: true, isTitleMatch: false } }));
        } else {
          const lowerQuery = searchQuery.toLowerCase();
          result = voted
            .filter(p => p.creator.toLowerCase().includes(lowerQuery) || p.subject.toLowerCase().includes(lowerQuery))
            .map(p => ({ ...p, matchDetails: { isCreatorMatch: false, isVoterMatch: true, isTitleMatch: false } }));
        }
      } else if (searchQuery.length < 3) {
        result = preFilteredProposals;
      } else {
        const lowerQuery = searchQuery.toLowerCase();
        const votedIdsSet = new Set(votedProposalIds || []);
        result = preFilteredProposals.reduce((accumulator, proposal) => {
          const isCreatorMatch = proposal.creator.toLowerCase() === lowerQuery;
          const isVoterMatch = voterSearchQuery !== "" && votedIdsSet.has(proposal.proposal_id);
          const isTitleMatch = !isCreatorMatch && proposal.subject.toLowerCase().includes(lowerQuery);
          if (isCreatorMatch || isVoterMatch || isTitleMatch) {
            accumulator.push({ ...proposal, matchDetails: { isCreatorMatch, isVoterMatch, isTitleMatch } });
          }
          return accumulator;
        }, [] as (typeof enrichedProposals[0] & { matchDetails: MatchDetails })[]);
      }
    }

    if (favoritesOnly) {
      result = result.filter(p => watchedProposalIds.has(p.proposal_id));
    }
    if (votedOnly && myVotedProposalIds) {
      const myVotedSet = new Set(myVotedProposalIds);
      result = result.filter(p => myVotedSet.has(p.proposal_id));
    }
    return result;
  }, [enrichedProposals, statusFilter, searchQuery, votedProposalIds, voterSearchQuery, proposalIdSearch, voterFilter, favoritesOnly, watchedProposalIds, votedOnly, myVotedProposalIds]);

  const searchedReturnProposal = useMemo(() => searchedProposals.find((p) => p.proposal_id === 0), [searchedProposals]);
  const fundedProposals = useMemo(() => searchedProposals.filter((p) => p.isFunded && p.proposal_id !== 0), [searchedProposals]);
  const unfundedProposals = useMemo(() => searchedProposals.filter((p) => !p.isFunded && p.proposal_id !== 0), [searchedProposals]);
  
  const renderContent = () => {
    if (isProposalsError) {
      return <ErrorMessage message={t("proposalsPage.errorMessage")} />;
    }

    const isLoading = proposalIdSearch !== null
        ? isFindProposalLoading
        : isProposalsLoading || (voterSearchQuery !== "" && isVoterListLoading) || (votedOnly && isMyVotedLoading);

    if (isLoading) {
      return (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProposalCardSkeleton key={`initial-load-${i}`} />
          ))}
        </div>
      );
    }
    
    if (fundedProposals.length === 0 && unfundedProposals.length === 0 && !searchedReturnProposal) {
      return <NoResult descriptionKey={t("proposalsPage.noResults")} />;
    }
    
    const shouldShowReturnProposal = searchedReturnProposal && (statusFilter === "active" || statusFilter === "all");
    const hasAnyFundedContent = fundedProposals.length > 0 || shouldShowReturnProposal;
    const hasUnfundedContent = unfundedProposals.length > 0;

    return (
      <>
        {fundedProposals.length > 0 && (
          <div className="flex flex-col gap-4">
            {fundedProposals.map((proposal) => (
              <ProposalCard
                key={proposal.proposal_id}
                proposal={proposal}
              />
            ))}
          </div>
        )}

        {shouldShowReturnProposal && (
          <div className={fundedProposals.length > 0 ? "mt-4" : ""}>
            <ReturnProposalCard proposal={searchedReturnProposal} />
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
  
  const totalBudgetHBD = formatNumber(totalBudgetNumber ?? 0, false, true);
  const dailyBudgetHBD = formatNumber(dailyBudgetNumber ?? 0, false, true);
  const dailyFundedHBD = formatNumber(dailyFunded ?? 0, false, true);

  const budgets = [
    {
      key: "daily_funded",
      label: t("proposalControls.dailyFunded"),
      value: `${dailyFundedHBD} HBD`,
    },
    {
      key: "daily_budget",
      label: t("proposalControls.dailyBudget"),
      value: `${dailyBudgetHBD} HBD`,
    },
    {
      key: "total_budget",
      label: t("proposalControls.totalBudget"),
      value: `${totalBudgetHBD} HBD`,
    },
  ];

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
          <BudgetsSection budgets={budgets} />
        </div>
        <div className="mt-4">
          <ProposalAnalytics />
        </div>
        <div className="mt-8">
          <ProposalControls
            currentStatus={statusFilter}
            onStatusChange={handleStatusChange}
            searchQuery={searchQuery}
            onSearch={handleSearchChange}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            sortDirection={sortDirection}
            onSortDirectionChange={handleSortDirectionChange}
            favoritesOnly={favoritesOnly}
            onFavoritesToggle={() => setFavoritesOnly(v => !v)}
            votedOnly={votedOnly || !!voterFilter}
            onVotedToggle={() => {
              const isActive = votedOnly || !!voterFilter;
              if (voterFilter) clearVoterFilter();
              setVotedOnly(!isActive);
            }}
            isLoggedIn={isLoggedIn}
          />
          {voterFilter && (
            <div className="flex items-center gap-2 px-3 py-2 -mt-px bg-blue-50 dark:bg-blue-950/20 border border-t-0 border-blue-200 dark:border-blue-800/30 rounded-b-[8px] text-sm text-blue-700 dark:text-blue-300">
              <HeartHandshake className="h-4 w-4 flex-shrink-0" />
              <span>{t("proposalsPage.voterFilterBanner", { username: voterFilter })}</span>
              <button
                onClick={clearVoterFilter}
                className="ml-auto flex items-center gap-1 text-xs hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                {t("proposalsPage.voterFilterClear")}
              </button>
            </div>
          )}
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