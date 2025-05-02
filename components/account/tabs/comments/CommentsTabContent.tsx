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

  useEffect(() => {
    if (!router.isReady) return;

    const accounNameFromRoute = trimAccountName(
      router.query.accountName as string
    );
    setAccountName(accounNameFromRoute);
  }, [router.isReady, router.query.accountName]);

  // Don't show filters if only account name is present
  useEffect(() => {
    Object.keys(DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS).forEach((key) => {
      if (key === "accountName" || key === "page") return;

      const param =
        paramsState[key as keyof typeof DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS];
      const defaultParam =
        DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS[
          key as keyof typeof DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS
        ];

      const visibleFilters =
        (isFiltersActive &&
          getLocalStorage("is_comments_filters_visible", true)) ??
        true;

      if (param !== defaultParam) {
        setIsFiltersActive(true);
        setIsVisible(visibleFilters);
      }
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState, isFiltersActive]);

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
          <CardTitle className="text-left">Filters</CardTitle>
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
