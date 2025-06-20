import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import AccountCommentsPermlinkSearch from "./AccountCommentsPermlinkSearch";
import AccountCommentPermlinkSearchResults from "./AccountCommentPermlinkSearchResults";
import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import { trimAccountName } from "@/utils/StringUtils";
import useURLParams from "@/hooks/common/useURLParams";
import { cn } from "@/lib/utils";
import { getLocalStorage } from "@/utils/LocalStorage";
import useBlockNavigation from "@/hooks/common/useBlockNavigation";
import BlockNavigation from "@/components/BlockNavigation";
import { useI18n } from "@/i18n/i18n";

interface CommnetsTabContentProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
  isFiltersActive: boolean;
}

export const DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS = {
  accountName: undefined,
  page: 1,
  commentType: "all",
  fromBlock: undefined,
  toBlock: undefined,
  startDate: undefined,
  endDate: undefined,
  lastBlocks: undefined,
  lastTime: 30,
  rangeSelectKey: "none",
  timeUnit: "days",
};

const CommentsTabContent: React.FC<CommnetsTabContentProps> = ({
  isVisible,
  setIsVisible,
  setIsFiltersActive,
  isFiltersActive,
}) => {
  const { t } = useI18n();
  const router = useRouter();
  const [accountName, setAccountName] = useState("");
  const { paramsState, setParams }: any = useURLParams(
    {
      ...DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS,
      accountName,
    },
    ["accountName"]
  );


  const props = (() => {
    if (paramsState.activeTab === "comments") {
      return {
        ...paramsState,
        accountName,
      };
    }
  })();

  const { permlinkSearchData, permlinkSearchDataLoading } =
    usePermlinkSearch(props);

  const {
    handleLoadNextBlocks,
    handleLoadPreviousBlocks,
    hasMoreBlocks,
    hasPreviousBlocks,
  } = useBlockNavigation(
    paramsState.toBlock,
    permlinkSearchData,
    paramsState,
    setParams
  );

  useEffect(() => {
    if (!router.isReady) return;

    const accounNameFromRoute = trimAccountName(
      router.query.accountName as string
    );
    setAccountName(accounNameFromRoute);
  }, [router.isReady, router.query.accountName]);
  const hasActiveFilters = Boolean(
    (paramsState.filters?.length ?? 0) ||
      paramsState.fromBlock ||
      (paramsState.toBlock && paramsState.history.length < 2) ||
      paramsState.startDate ||
      paramsState.endDate ||
      paramsState.commentType !== "all"
  );

  useEffect(() => {
    setIsFiltersActive(hasActiveFilters);

    if (hasActiveFilters) {
      const persisted = getLocalStorage("is_comments_filters_visible", true);
      setIsVisible(persisted);
    } else {
      setIsVisible(false);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveFilters]);

  return (
    <TabsContent value="comments">
      <Card
        className={cn(
          "mb-4 overflow-hidden transition-all duration-500 ease-in max-h-0 opacity-0",
          {
            "max-h-full opacity-100": isVisible,
          }
        )}
      >
        <CardHeader>
          <CardTitle className="text-left">{t("common.filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountCommentsPermlinkSearch
            isDataLoading={permlinkSearchDataLoading}
            accountName={accountName}
            setIsFiltersActive={setIsFiltersActive}
            setIsVisible={setIsVisible}
          />
        </CardContent>
      </Card>
      <BlockNavigation
        fromBlock={permlinkSearchData?.block_range.from}
        toBlock={permlinkSearchData?.block_range.to}
        hasPrevious={hasPreviousBlocks}
        hasNext={hasMoreBlocks}
        loadPreviousBlocks={handleLoadPreviousBlocks}
        loadNextBlocks={handleLoadNextBlocks}
        urlParams={paramsState}
        className="rounded mb-4"
      />
      <AccountCommentPermlinkSearchResults
        data={permlinkSearchData}
        accountName={accountName}
        paramsState={paramsState}
        setParams={setParams}
      />
    </TabsContent>
  );
};

export default CommentsTabContent;
