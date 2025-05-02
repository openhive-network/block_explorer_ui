import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import AccountPageInteractionSearch from "./AccountPageInteractionSearch";
import NoResult from "@/components/NoResult";
import useURLParams from "@/hooks/common/useURLParams";
import InteractionsTabResult from "./InteractionsTabResult";
import { cn, convertBooleanArrayToIds } from "@/lib/utils";
import { DEFAULT_PARAMS } from "./AccountPageInteractionSearch";
import { getLocalStorage } from "@/utils/LocalStorage";

interface InteractionsTabContentProps {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  setIsFiltersActive: Dispatch<SetStateAction<boolean>>;
  isFiltersActive: boolean;
}

const InteractionsTabContent: React.FC<InteractionsTabContentProps> = ({
  isVisible,
  setIsVisible,
  setIsFiltersActive,
  isFiltersActive,
}) => {
  const router = useRouter();

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

  const {
    commentSearchData,
    isCommentSearchDataLoading,
    isCommentSearchDataFetching,
  } = useCommentSearch(props);

  const buildCommentSearchView = () => {
    if (!commentSearchData) return;
    if (!isCommentSearchDataFetching && !commentSearchData?.total_operations) {
      return (
        <div>
          <NoResult />
        </div>
      );
    } else if (isCommentSearchDataLoading || isCommentSearchDataFetching) {
      return (
        <div className="flex justify-center text-center items-center">
          <Loader2 className="animate-spin mt-1 text-text h-12 w-12 ml-3 ..." />
        </div>
      );
    } else {
      return <InteractionsTabResult data={commentSearchData} />;
    }
  };

  // Don't show filters section if only account name is present
  useEffect(() => {
    Object.keys(DEFAULT_PARAMS).forEach((key) => {
      if (key === "accountName") return;

      const param = paramsState[key as keyof typeof DEFAULT_PARAMS];
      const defaultParam = DEFAULT_PARAMS[key as keyof typeof DEFAULT_PARAMS];

      const visibleFilters =
        (isFiltersActive &&
          getLocalStorage("is_interactions_filters_visible", true)) ??
        true;

      if (param !== defaultParam) {
        setIsFiltersActive(true);
        setIsVisible(visibleFilters);
      }
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsState, isFiltersActive]);

  return (
    <TabsContent value="interactions">
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
          <AccountPageInteractionSearch
            setIsFiltersActive={setIsFiltersActive}
            isCommentSearchDataLoading={isCommentSearchDataFetching}
          />
        </CardContent>
      </Card>
      {buildCommentSearchView()}
    </TabsContent>
  );
};

export default InteractionsTabContent;
