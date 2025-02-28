import { useState, useEffect } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useRouter } from "next/router";
import moment from "moment";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import AccountCommentsPermlinkSearch from "./AccountCommentsPermlinkSearch";
import AccountCommentPermlinkSearchResults from "./AccountCommentPermlinkSearchResults";
import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import { trimAccountName } from "@/utils/StringUtils";
import useURLParams from "@/hooks/common/useURLParams";

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

const CommentsTabContent = () => {
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
    ...DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS,
    ...paramsState,
    accountName,
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

  const [isCardContentHidden, setIsCardContentHidden] = useState(true);

  const handleCardContentVisibility = () => {
    setIsCardContentHidden(!isCardContentHidden);
  };

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
        setIsCardContentHidden(false);
      }
    });
  }, [paramsState]);

  return (
    <TabsContent value="comments">
      <Card className="mb-4">
        <CardHeader
          className="p-0 m-0"
          onClick={handleCardContentVisibility}
        >
          <div className="flex justify-center  items-center p-3 hover:bg-rowHover cursor-pointer">
            <div className="w-full text-center text-2xl">Comment Search</div>
            <div className="flex justify-end items-center">
              {isCardContentHidden ? <ArrowDown /> : <ArrowUp />}
            </div>
          </div>
        </CardHeader>
        <CardContent hidden={isCardContentHidden}>
          <AccountCommentsPermlinkSearch
            isDataLoading={permlinkSearchDataLoading}
            accountName={accountName}
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
