import { useState, useCallback, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import CommunityControls from "@/components/communities/CommunityControls";
import NoResult from "@/components/NoResult";
import ErrorMessage from "@/components/ErrorMessage";
import CommunityCard, {
  CommunityCardSkeleton,
} from "@/components/communities/CommunityCard";
import CommunitySubscribersDialog from "@/components/account/CommunitySubscribersDialog";
import type { GetServerSideProps } from "next";
import Seo from "@/components/seo/Seo";
import { SeoMeta, listPageMeta, pageTitle } from "@/utils/seo";
import { seoText } from "@/utils/seoStrings";
import PageTitle from "@/components/PageTitle";

import useCommunitiesList, {
  CommunitySortOrder,
} from "@/hooks/api/communities/useCommunities";
import Hive from "@/types/Hive";

const CommunitiesPage = ({ meta }: { meta: SeoMeta }) => {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CommunitySortOrder>("rank");

  const [dialogCommunity, setDialogCommunity] =
    useState<Hive.CommunityListItem | null>(null);

  const {
    communities,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunitiesList(query, sort);

  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 500;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleOpenSubscribersDialog = (community: Hive.CommunityListItem) => {
    setDialogCommunity(community);
  };

  const renderContent = () => {
    if (isError) {
      return <ErrorMessage message={t("communitiesPage.errorMessage")} />;
    }

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CommunityCardSkeleton key={`initial-load-${i}`} />
          ))}
        </div>
      );
    }

    if (communities.length === 0) {
      return <NoResult descriptionKey={t("communitiesPage.noResults")} />;
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {communities.map((community) => (
          <CommunityCard
            key={community.name}
            community={community}
            onSubscribersClick={handleOpenSubscribersDialog}
          />
        ))}
        {isFetchingNextPage &&
          Array.from({ length: 4 }).map((_, i) => (
            <CommunityCardSkeleton key={`next-page-load-${i}`} />
          ))}
      </div>
    );
  };

  return (
    <>
      <Seo meta={meta} title={pageTitle(t("communitiesPage.title"))} />
      <div className="page-container">
        <div>
          <PageTitle titleKey="pageTitle.communities" className="py-4 ml-6" />
        </div>

        <div className="mt-4">
          <CommunityControls
            query={query}
            onQueryChange={setQuery}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        <main>{renderContent()}</main>

        <footer className="pt-8 pb-4 text-center text-sm text-slate-500">
          {!hasNextPage && !isLoading && communities.length > 0 && (
            <p>{t("communitiesPage.endOfResults")}</p>
          )}
        </footer>

        {dialogCommunity && (
          <CommunitySubscribersDialog
            isOpen={!!dialogCommunity}
            onClose={() => setDialogCommunity(null)}
            communityName={dialogCommunity.name}
            communityTitle={dialogCommunity.title}
          />
        )}
      </div>
    </>
  );
};

export default CommunitiesPage;

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req }) => ({
  props: {
    meta: listPageMeta(
      req,
      "/communities",
      seoText("seo.communities.title"),
      seoText("seo.communities.description")
    ),
  },
});
