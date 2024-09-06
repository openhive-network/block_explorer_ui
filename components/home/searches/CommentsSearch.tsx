import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { config } from "@/Config";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import { trimAccountName } from "@/utils/StringUtils";
import {
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import { SearchRangesResult } from "@/hooks/common/useSearchRanges";
import { Input } from "@/components/ui/input";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";

interface CommentsSearchProps {
  startCommentsSearch: (
    accountSearchOperationsProps: Explorer.CommentSearchParams
  ) => Promise<void>;
  operationsTypes?: Hive.OperationPattern[];
  data?: Explorer.CommentSearchParams;
  loading?: boolean;
  searchRanges: SearchRangesResult;
}

const CommentsSearch: React.FC<CommentsSearchProps> = ({
  startCommentsSearch,
  operationsTypes,
  loading,
  data,
  searchRanges,
}) => {
  const [accountName, setAccountName] = useState<string>("");
  const [permlink, setPermlink] = useState<string>("");
  const [
    selectedCommentSearchOperationTypes,
    setSelectedCommentSearchOperationTypes,
  ] = useState<number[]>([]);

  const { getRangesValues } = searchRanges;

  const setSearchValues = (data: Explorer.CommentSearchParams) => {
    data.accountName && setAccountName(data.accountName);
    data.permlink && setPermlink(data.permlink);
    data.filters &&
      setSelectedCommentSearchOperationTypes(
        convertBooleanArrayToIds(data.filters)
      );
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

      const commentSearchProps: Explorer.CommentSearchParams = {
        accountName: trimAccountName(accountName),
        permlink: permlink !== "" ? permlink : undefined,
        fromBlock: payloadFromBlock,
        toBlock: payloadToBlock,
        startDate: payloadStartDate,
        endDate: payloadEndDate,
        filters: selectedCommentSearchOperationTypes.length
          ? convertIdsToBooleanArray(selectedCommentSearchOperationTypes)
          : undefined,
        lastBlocks:
          searchRanges.rangeSelectKey === "lastBlocks"
            ? searchRanges.lastBlocksValue
            : undefined,
        lastTime: searchRanges.lastTimeUnitValue,
        page: data?.page || 1,
        rangeSelectKey: searchRanges.rangeSelectKey,
        timeUnit: searchRanges.timeUnitSelectKey,
      };
      startCommentsSearch(commentSearchProps);
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
      <p className="ml-2">
        Find all operations related to comments of given account or for exact
        permlink.
      </p>
      <div className="flex flex-col">
        <Input
          data-testid="account-name"
          className="w-1/2 bg-explorer-dark-gray border-0 border-b-2"
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Author *"
          required
        />
      </div>
      <div className="flex flex-col">
        <Input
          data-testid="permlink-input"
          className="w-1/2 bg-explorer-dark-gray border-0 border-b-2"
          type="text"
          value={permlink}
          onChange={(e) => setPermlink(e.target.value)}
          placeholder="Permlink"
        />
      </div>
      <SearchRanges
        rangesProps={searchRanges}
        safeTimeRangeDisplay
      />
      <div className="flex items-center">
        <OperationTypesDialog
          operationTypes={operationsTypes?.filter((opType) =>
            config.commentOperationsTypeIds.includes(opType.op_type_id)
          )}
          selectedOperations={selectedCommentSearchOperationTypes}
          setSelectedOperations={setSelectedCommentSearchOperationTypes}
          buttonClassName="bg-gray-500"
          triggerTitle={getOperationButtonTitle(
            selectedCommentSearchOperationTypes,
            operationsTypes
          )}
        />
      </div>
      <div className="flex items-center">
        <Button
          data-testid="search-button"
          className=" bg-blue-800 hover:bg-blue-600 rounded mr-2"
          onClick={onButtonClick}
          disabled={!accountName}
        >
          Search
          {loading && <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />}
        </Button>
        {!accountName && (
          <label className="text-muted-foreground">Set author name</label>
        )}
      </div>
    </>
  );
};

export default CommentsSearch;
