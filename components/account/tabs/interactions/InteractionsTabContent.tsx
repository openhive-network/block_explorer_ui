import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import AccountPageInteractionSearch from "./AccountPageInteractionSearch";
import NoResult from "@/components/NoResult";
import useURLParams from "@/hooks/common/useURLParams";
import InteractionsTabResult from "./InteractionsTabResult";
import { convertBooleanArrayToIds } from "@/lib/utils";
import { DEFAULT_PARAMS } from "./AccountPageInteractionSearch";

const InteractionsTabContent = () => {
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

  return (
    <TabsContent value="interactions">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Interaction Search</CardTitle>
        </CardHeader>
        <CardContent>
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
