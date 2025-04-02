import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";
import moment from "moment";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import AccountCommentsPermlinkSearch from "./AccountCommentsPermlinkSearch";
import AccountCommentPermlinkSearchResults from "./AccountCommentPermlinkSearchResults";
import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import { trimAccountName } from "@/utils/StringUtils";
import useURLParams from "@/hooks/common/useURLParams";
import { cn } from "@/lib/utils";

interface CommnetsTabContentProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
}

export const DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS = {
  accountName: undefined,
  commentType: "post",
  pageNumber: 1,
  fromBlock: undefined,
  toBlock: undefined,
  startDate: moment(Date.now()).subtract(30, "days").toDate(),
  endDate: undefined,
  lastBlocks: undefined,
  lastTime: 30,
  rangeSelectKey: "lastTime",
  timeUnit: "days",
};

const CommentsTabContent: React.FC<CommnetsTabContentProps> = ({
  isVisible,
  setIsVisible,
  setIsFiltersActive,
}) => {
  const router = useRouter();
  const [accountName, setAccountName] = useState("");
  const { paramsState } = useURLParams(
    {
      ...DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS,
      accountName,
    },
    ["accountName"]
  );

  const props = {
    ...paramsState,
    accountName,
    startDate:
      paramsState?.rangeSelectKey === "none"
        ? undefined
        : paramsState.startDate ||
          DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS.startDate,
  };

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
      if (key === "accountName") return;

      const param =
        paramsState[key as keyof typeof DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS];
      const defaultParam =
        DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS[
          key as keyof typeof DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS
        ];
      if (param !== defaultParam) {
        setIsFiltersActive(true);
        setIsVisible(true);
      }
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState]);

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
      />
    </TabsContent>
  );
};

export default CommentsTabContent;
