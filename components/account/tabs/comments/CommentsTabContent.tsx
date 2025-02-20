import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import AccountCommentsPermlinkSearch from "./AccountCommentsPermlinkSearch";
import AccountCommentPermlinkSearchResults from "./AccountCommentPermlinkSearchResults";
import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import { useSearchesContext } from "@/contexts/SearchesContext";
import moment from "moment";
import { useState, useEffect } from "react";
import { trimAccountName } from "@/utils/StringUtils";
import { useRouter } from "next/router";

const DEFAULT_SEARCH_PROPS = {
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
  const { permlinkSearchProps } = useSearchesContext();
  const router = useRouter();
  const [accountName, setAccountName] = useState("");

  const props = {
    ...DEFAULT_SEARCH_PROPS,
    ...permlinkSearchProps,
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

  return (
    <TabsContent value="comments">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Comment Search</CardTitle>
        </CardHeader>
        <CardContent>
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
