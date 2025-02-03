import { useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import CommentSearchResults from "@/components/home/searches/searchesResults/CommentSearchResults";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useSearchesContext } from "@/contexts/SearchesContext";
import AccountPageInteractionSearch from "./AccountPageInteractionSearch";
import NoResult from "@/components/NoResult";

const InteractionsTabContent = () => {
  const router = useRouter();
  const accountNameFromRoute = (router.query.accountName as string)?.replace(
    "@",
    ""
  );
  const {
    setCommentsSearchAccountName,
    commentSearchProps,
    setCommentSearchProps,
    setSelectedCommentSearchOperationTypes,
    setCommentsSearchPermlink,
  } = useSearchesContext();

  const { commentSearchData, isCommentSearchDataLoading } =
    useCommentSearch(commentSearchProps);

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
      return <CommentSearchResults />;
    }
  };

  useEffect(() => {
    setCommentsSearchAccountName(accountNameFromRoute);

    return () => setCommentsSearchAccountName("");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNameFromRoute]);

  const handleClearCommentSearch = () => {
    setCommentsSearchPermlink(undefined);
    setCommentSearchProps(undefined);
    setSelectedCommentSearchOperationTypes(null);
  };

  // Clean data after account name change
  useEffect(() => {
    if (!accountNameFromRoute) return;

    return () => handleClearCommentSearch();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNameFromRoute]);

  return (
    <TabsContent value="interactions">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Interaction Search</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountPageInteractionSearch />
        </CardContent>
      </Card>
      {buildCommentSearchView()}
    </TabsContent>
  );
};

export default InteractionsTabContent;
