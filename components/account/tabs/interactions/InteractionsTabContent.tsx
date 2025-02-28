import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";

import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import AccountPageInteractionSearch from "./AccountPageInteractionSearch";
import NoResult from "@/components/NoResult";
import useURLParams from "@/hooks/common/useURLParams";
import InteractionsTabResult from "./InteractionsTabResult";
import { convertBooleanArrayToIds } from "@/lib/utils";
import { DEFAULT_PARAMS } from "./AccountPageInteractionSearch";

const InteractionsTabContent = () => {
  const router = useRouter();
  const [isCardContentHidden, setIsCardContentHidden] = useState(true);

  const accountNameFromRoute = (router.query.accountName as string)?.replace(
    "@",
    ""
  );

  const { paramsState } = useURLParams(DEFAULT_PARAMS, ["accountName"]);

  const props = {
    ...paramsState,
    operationTypes: paramsState.filters
      ? convertBooleanArrayToIds(paramsState.filters)
      : null,
    accountName: accountNameFromRoute,
  } as any;

  const { commentSearchData, isCommentSearchDataLoading } =
    useCommentSearch(props);

  const buildCommentSearchView = () => {
    if (!isCommentSearchDataLoading && !commentSearchData?.total_operations) {
      return (
        <div>
          <NoResult />
        </div>
      );
    } else if (isCommentSearchDataLoading) {
      return (
        <div className="flex justify-center text-center items-center">
          <Loader2 className="animate-spin mt-1 text-text h-12 w-12 ml-3 ..." />
        </div>
      );
    } else {
      return <InteractionsTabResult data={commentSearchData} />;
    }
  };

  const handleCardContentVisibility = () => {
    setIsCardContentHidden(!isCardContentHidden);
  };

  // Don't show filters section if only account name and permlink are present
  useEffect(() => {
    Object.keys(DEFAULT_PARAMS).forEach((key) => {
      if (key === "accountName" || key === "permlink") return;

      const param = paramsState[key as keyof typeof DEFAULT_PARAMS];
      const defaultParam = DEFAULT_PARAMS[key as keyof typeof DEFAULT_PARAMS];
      if (param !== defaultParam) {
        setIsCardContentHidden(false);
      }
    });
  }, [paramsState]);

  return (
    <TabsContent value="interactions">
      <Card className="mb-4">
        <CardHeader
          className="p-0 m-0"
          onClick={handleCardContentVisibility}
        >
          <div className="flex justify-center  items-center p-3 hover:bg-rowHover cursor-pointer">
            <div className="w-full text-center text-2xl">
              Interaction Search
            </div>
            <div className="flex justify-end items-center">
              {isCardContentHidden ? <ArrowDown /> : <ArrowUp />}
            </div>
          </div>
        </CardHeader>
        <CardContent hidden={isCardContentHidden}>
          <AccountPageInteractionSearch
            isCommentSearchDataLoading={isCommentSearchDataLoading}
          />
        </CardContent>
      </Card>
      {buildCommentSearchView()}
    </TabsContent>
  );
};

export default InteractionsTabContent;
