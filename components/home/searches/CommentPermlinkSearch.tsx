import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Explorer from "@/types/Explorer";
import { trimAccountName } from "@/utils/StringUtils";
import { SearchRangesResult } from "@/hooks/common/useSearchRanges";
import { Input } from "@/components/ui/input";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";

interface CommentsPermlinkSearchProps {
  startCommentPermlinkSearch: (
    accountSearchOperationsProps: Explorer.CommentPermlinSearchParams
  ) => Promise<void>;
  data?: Explorer.PermlinkSearchProps;
  loading?: boolean;
  searchRanges: SearchRangesResult;
}

const CommentsPermlinkSearch: React.FC<CommentsPermlinkSearchProps> = ({
  startCommentPermlinkSearch,
  loading,
  data,
  searchRanges,
}) => {
  const [accountName, setAccountName] = useState<string>("");

  const { getRangesValues } = searchRanges;

  const setSearchValues = (data: Explorer.PermlinkSearchProps | any) => {
    data.accountName && setAccountName(data.accountName);
    searchRanges.setRangesValues(data);
  };

  const onButtonClick = async () => {
    if (accountName !== "") {
      const {
        payloadFromBlock,
        payloadToBlock,
        payloadStartDate,
        payloadEndDate,
      } = await getRangesValues();

      const commentPermlinksSearchProps: Explorer.PermlinkSearchProps | any = {
        accountName: trimAccountName(accountName),
        fromBlock: payloadFromBlock,
        toBlock: payloadToBlock,
        startDate: payloadStartDate,
        endDate: payloadEndDate,
        lastBlocks:
          searchRanges.rangeSelectKey === "lastBlocks"
            ? searchRanges.lastBlocksValue
            : undefined,
        lastTime: searchRanges.lastTimeUnitValue,
        page: data?.page || 1,
        rangeSelectKey: searchRanges.rangeSelectKey,
        timeUnit: searchRanges.timeUnitSelectKey,
      };
      startCommentPermlinkSearch(commentPermlinksSearchProps);
    }
  };

  useEffect(() => {
    if (!!data) {
      setSearchValues(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <p className="ml-2">Find comments permlinks by account name</p>
      <div className="flex flex-col">
        <Input
          data-testid="account-name"
          className="w-1/2 bg-theme dark:bg-theme border-0 border-b-2"
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Author *"
          required
        />
      </div>
      <SearchRanges
        rangesProps={searchRanges}
        safeTimeRangeDisplay
      />
      <div className="flex items-center">
        <Button
          data-testid="search-button"
          className="mr-2 my-2"
          onClick={onButtonClick}
          disabled={!accountName}
        >
          Search
          {loading && <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />}
        </Button>
        {!accountName && (
          <label className="text-gray-300 dark:text-gray-500 ">
            Set author name
          </label>
        )}
      </div>
    </>
  );
};

export default CommentsPermlinkSearch;
