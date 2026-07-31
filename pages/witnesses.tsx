import React, { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/i18n/i18n";
import Seo from "@/components/seo/Seo";
import {
  SeoMeta,
  listPageMeta,
  pageTitle,
  SEO_LIST_CACHE_CONTROL,
} from "@/utils/seo";
import { seoText } from "@/utils/seoStrings";
import { Loader2, ArrowRight, Heart, Search, Users } from "lucide-react";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useWitnessVoteChain from "@/hooks/api/common/useWitnessVoteChain";
import { useAuth } from "@/contexts/AuthContext";
import VoterFilterBanner from "@/components/Witnesses/VoterFilterBanner";
import useCompareSelection from "@/hooks/common/useCompareSelection";
import CompareSelectionBar from "@/components/compare/CompareSelectionBar";
import WitnessesTable, {
  SORT_KEY_BY_CELL,
} from "@/components/Witnesses/WitnessesTable";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import WitnessScheduleIcon from "@/components/WitnessScheduleIcon";
import ScrollTopButton from "@/components/ScrollTopButton";
import { config } from "@/Config";
import NoResult from "@/components/NoResult";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import Hive from "@/types/Hive";
import PageTitle from "@/components/PageTitle";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";

const VotersDialog = dynamic(
  () => import("@/components/Witnesses/VotersDialog"),
  { ssr: false }
);
const VotesHistoryDialog = dynamic(
  () => import("@/components/Witnesses/VotesHistoryDialog"),
  { ssr: false }
);

export default function Witnesses({ meta }: { meta: SeoMeta }) {
  const { t, locale } = useI18n();
  const seoTitle = pageTitle(t("witnesses.title"));
  const router = useRouter();
  const queryClient = useQueryClient();
  const compareSelection = useCompareSelection();

  // Handle a Hivesigner return — toast, invalidate caches, scroll to the row.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get("hsAction");
    const witness = params.get("hsWitness") || "";
    if (!action) return;

    // Defer one tick so the Toaster has mounted.
    const toastTimer = window.setTimeout(() => {
      let msg = "";
      switch (action) {
        case "vote":
          msg = t("witnesses.voteSuccess", { witness });
          break;
        case "unvote":
          msg = t("witnesses.unvoteSuccess", { witness });
          break;
        case "setproxy":
          msg = t("witnesses.proxySuccess", { proxy: witness });
          break;
        case "removeproxy":
          msg = t("witnesses.removeProxySuccess");
          break;
        default:
          return;
      }
      toast.success(msg, { duration: 8000 });
    }, 50);

    queryClient.invalidateQueries({ queryKey: ["witnesses"] });
    queryClient.invalidateQueries({ queryKey: ["witnessVoteChain"] });
    queryClient.invalidateQueries({ queryKey: ["witnessHealth"] });

    const cleanUrl = () => {
      const p = new URLSearchParams(window.location.search);
      if (!p.has("hsAction") && !p.has("hsWitness")) return;
      p.delete("hsAction");
      p.delete("hsWitness");
      const remaining = p.toString();
      history.replaceState(
        null,
        "",
        window.location.pathname + (remaining ? `?${remaining}` : "")
      );
    };

    // No row to scroll to when removing a proxy or unvoting inside a
    // voter-filtered view (the row is gone from the filtered list).
    const skipScroll = !witness || (action === "unvote" && params.get("voter"));
    if (skipScroll) {
      cleanUrl();
      return () => clearTimeout(toastTimer);
    }

    const selector = `[data-witness-row="${CSS.escape(witness)}"]`;
    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts++;
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        clearInterval(interval);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        cleanUrl();
      } else if (attempts > 80) {
        clearInterval(interval);
        cleanUrl();
      }
    }, 250);
    return () => {
      clearTimeout(toastTimer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const voterFilter = router.isReady
    ? (router.query.voter as string | undefined)
    : undefined;

  const [voterAccount, setVoterAccount] = useState<string>("");
  const [isVotersOpen, setIsVotersOpen] = useState<boolean>(false);
  const [isVotesHistoryOpen, setIsVotesHistoryOpen] = useState<boolean>(false);
  const [voterSearch, setVoterSearch] = useState<string>("");

  const handleVoterSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = voterSearch.trim().replace(/^@/, "");
    if (!name) return;
    router.push(`/witnesses?voter=${encodeURIComponent(name)}`);
    setVoterSearch("");
  };
  const [sort, setSort] = useState<{
    orderBy: string;
    isOrderAscending: boolean;
  }>({
    orderBy: SORT_KEY_BY_CELL["rank"],
    isOrderAscending: true,
  });

  // When filtering by voter, fetch a larger window so lower-ranked
  // witnesses can still resolve.
  const { witnessesData, isWitnessDataLoading } = useWitnesses(
    voterFilter ? 1000 : config.witnessesPerPages.witnesses,
    voterFilter ? SORT_KEY_BY_CELL["rank"] : sort.orderBy,
    voterFilter ? "asc" : sort.isOrderAscending ? "asc" : "desc"
  );

  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  const [totalVestingShares, setTotalVestingShares] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingShares
  );
  const [totalVestingFundHive, setTotalVestingFundHive] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingFundHive
  );

  useEffect(() => {
    if (dynamicGlobalData?.headBlockDetails) {
      setTotalVestingShares(
        dynamicGlobalData.headBlockDetails.rawTotalVestingShares
      );
      setTotalVestingFundHive(
        dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive
      );
    }
  }, [dynamicGlobalData]);

  const {
    witnessVotes: voterWitnessVotes,
    proxyChain,
    isLoading: isFilterLoading,
  } = useWitnessVoteChain(voterFilter || "");

  const { username, isLoggedIn } = useAuth();

  // Logged-in user's proxy chain — drives the proxy banner.
  const { proxyChain: userProxyChain } = useWitnessVoteChain(
    isLoggedIn ? username || "" : ""
  );

  // Only show the actions column when the user is viewing their own votes.
  const showVoteColumn =
    isLoggedIn && (!voterFilter || voterFilter === username);

  // Local vote overrides so the filter reflects clicks before the chain commits.
  const [localVoteChanges, setLocalVoteChanges] = useState<
    Record<string, boolean>
  >({});

  const handleVoteChange = (witnessName: string, voted: boolean) => {
    setLocalVoteChanges((prev) => ({ ...prev, [witnessName]: voted }));
  };

  const filteredWitnesses = useMemo(() => {
    if (!witnessesData?.witnesses) return [];
    if (!voterFilter) return witnessesData.witnesses;
    const voteSet = new Set(voterWitnessVotes);
    if (voterFilter === username) {
      Object.entries(localVoteChanges).forEach(([w, voted]) => {
        if (voted) voteSet.add(w);
        else voteSet.delete(w);
      });
    }
    if (voteSet.size === 0) return [];
    return witnessesData.witnesses.filter((w: any) =>
      voteSet.has(w.witness_name)
    );
  }, [
    witnessesData,
    voterFilter,
    voterWitnessVotes,
    username,
    localVoteChanges,
  ]);

  const sortedFilteredWitnesses = useMemo(() => {
    if (!voterFilter || filteredWitnesses.length === 0)
      return filteredWitnesses;
    const apiFieldToObjField: Record<string, string> = {
      rank: "rank",
      witness: "witness_name",
      votes: "vests",
      voters_num: "voters_num",
      block_size: "block_size",
      missed_blocks: "missed_blocks",
      hbd_interest_rate: "hbd_interest_rate",
      price_feed: "price_feed",
      feed_updated_at: "feed_updated_at",
      version: "version",
      last_confirmed_block_num: "last_confirmed_block_num",
    };
    const field = apiFieldToObjField[sort.orderBy] ?? "rank";
    const dir = sort.isOrderAscending ? 1 : -1;
    return [...filteredWitnesses].sort((a: any, b: any) => {
      const av = a[field],
        bv = b[field];
      if (av == null && bv == null) return 0;
      if (av == null) return dir;
      if (bv == null) return -dir;
      if (typeof av === "number" && typeof bv === "number")
        return (av - bv) * dir;
      if (av instanceof Date && bv instanceof Date)
        return (av.getTime() - bv.getTime()) * dir;
      return (
        String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir
      );
    });
  }, [filteredWitnesses, voterFilter, sort]);

  useEffect(() => {
    if (witnessesData?.witnesses) {
      const versions = new Set<string>();
      witnessesData.witnesses.forEach((witness: any) => {
        versions.add(witness.version);
      });
      const sortedVersions = Array.from(versions).sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true })
      );
      setLatestVersion(sortedVersions[0] || null);
    }
  }, [witnessesData]);

  const handleSortBy = (clickedSortKey: string) => {
    if (!clickedSortKey || !SORT_KEY_BY_CELL[clickedSortKey]) return;
    const apiFieldForSort = SORT_KEY_BY_CELL[clickedSortKey];
    setSort((prevSort) => ({
      orderBy: apiFieldForSort,
      isOrderAscending:
        apiFieldForSort === prevSort.orderBy
          ? !prevSort.isOrderAscending
          : true,
    }));
  };

  if (isWitnessDataLoading) {
    return (
      <>
        <Seo meta={meta} title={seoTitle} />
        <Loader2 className="dark:text-white animate-spin mt-1 h-8 w-8 ml-3 ..." />
      </>
    );
  }

  if (!witnessesData || !witnessesData.witnesses.length)
    return <Seo meta={meta} title={seoTitle} />;

  return (
    <>
      <Seo meta={meta} title={seoTitle} />
      <div className="page-container rounded bg-white dark:bg-theme text-gray-800 dark:text-gray-200 font-sans antialiased">
        <div className="mx-4 my-4">
          <main className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-theme gap-3">
              <PageTitle titleKey="pageTitle.hiveWitnesses" className="py-4" />

              <div className="flex items-center gap-2 mb-2 md:mb-0 ml-1 md:ml-4 mr-4 flex-shrink-0">
                {/* Unified voter-lookup control: quick shortcuts + autocomplete search */}
                {isLoggedIn && (
                  <div className="inline-flex items-stretch rounded-full border border-navbar-border bg-secondary/20 hover:bg-secondary/30 transition-colors">
                    {voterFilter !== username && username && (
                      <Link
                        href={`/witnesses?voter=${username}`}
                        className="inline-flex items-center gap-1.5 px-3 rounded-l-full text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-r border-navbar-border transition-colors whitespace-nowrap"
                      >
                        <Heart
                          className="h-3.5 w-3.5"
                          fill="#ef4444"
                          stroke="#dc2626"
                        />
                        {t("witnesses.myVotes")}
                      </Link>
                    )}
                    {voterFilter && (
                      <Link
                        href="/witnesses"
                        className="inline-flex items-center gap-1.5 px-3 rounded-l-full text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-r border-navbar-border transition-colors whitespace-nowrap"
                      >
                        <Users className="h-3.5 w-3.5" />
                        {t("witnesses.allWitnesses")}
                      </Link>
                    )}
                    <form
                      onSubmit={handleVoterSearchSubmit}
                      className="flex items-center pl-2.5 pr-1 rounded-full"
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <AutocompleteInput
                        value={voterSearch}
                        onChange={setVoterSearch}
                        placeholder={t("witnesses.searchVoterPlaceholder")}
                        inputType="account_name"
                        className="!w-44 [&_input]:border-0 [&_input]:bg-transparent [&_input]:h-8 [&_input]:text-xs [&_input]:py-0 [&_input]:px-2 [&_input]:shadow-none [&_input]:focus-visible:ring-0"
                      />
                    </form>
                  </div>
                )}
                <WitnessScheduleIcon />
              </div>
            </div>

            {isLoggedIn && (
              <VoterFilterBanner
                voter={voterFilter || username || ""}
                isOwnView={!voterFilter || voterFilter === username}
                proxyChain={voterFilter ? proxyChain : userProxyChain}
                voteCount={voterWitnessVotes.length}
                isCountLoading={isFilterLoading}
                showWhenFiltered={!!voterFilter}
              />
            )}

            {isWitnessDataLoading ||
            !router.isReady ||
            (voterFilter && isFilterLoading) ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="dark:text-white animate-spin h-6 w-6" />
              </div>
            ) : sortedFilteredWitnesses.length > 0 ? (
              <>
                <VotersDialog
                  accountName={voterAccount}
                  isVotersOpen={isVotersOpen}
                  changeVotersDialogue={setIsVotersOpen}
                  liveDataEnabled={false}
                />
                <VotesHistoryDialog
                  accountName={voterAccount}
                  isVotesHistoryOpen={isVotesHistoryOpen}
                  changeVoteHistoryDialogue={setIsVotesHistoryOpen}
                  liveDataEnabled={false}
                />

                <WitnessesTable
                  witnesses={sortedFilteredWitnesses}
                  sort={sort}
                  onSortBy={handleSortBy}
                  showVoteColumn={showVoteColumn}
                  latestVersion={latestVersion}
                  hiveChain={hiveChain}
                  totalVestingFundHive={totalVestingFundHive}
                  totalVestingShares={totalVestingShares}
                  onOpenVoters={(name) => {
                    setVoterAccount(name);
                    setIsVotersOpen(true);
                  }}
                  onOpenVotesHistory={(name) => {
                    setVoterAccount(name);
                    setIsVotesHistoryOpen(true);
                  }}
                  onVoteChange={handleVoteChange}
                  compareSelection={compareSelection}
                />
              </>
            ) : voterFilter ? (
              <div className="flex flex-col items-center gap-4">
                <NoResult
                  titleKey="witnesses.noVotesForVoter"
                  descriptionKey="witnesses.noVotesForVoterDesc"
                />
                <Link
                  href="/witnesses"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-explorer-blue text-white text-sm font-medium shadow-sm hover:bg-explorer-blue/90 hover:shadow-md transition-all"
                >
                  {t("witnesses.browseAll")}
                  <ArrowRight
                    className={cn(
                      "w-4 h-4 transition-transform group-hover:translate-x-0.5",
                      locale === "ar" &&
                        "rotate-180 group-hover:-translate-x-0.5"
                    )}
                  />
                </Link>
              </div>
            ) : (
              <NoResult />
            )}
          </main>
        </div>
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>

        <CompareSelectionBar selection={compareSelection} t={t} />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: listPageMeta(
        req,
        "/witnesses",
        seoText("seo.witnesses.title"),
        seoText("seo.witnesses.description")
      ),
    },
  };
};
