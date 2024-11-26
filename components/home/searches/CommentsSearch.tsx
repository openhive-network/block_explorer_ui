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
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
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
    data.accountName && setAccountName(Array.isArray(data.accountName) ? data.accountName[0] : data.accountName);
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
        permlink,
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
      <AutocompleteInput
          value={accountName}
          onChange={setAccountName}
          placeholder="Author"
          inputType="account_name"
          className="w-1/2 bg-theme dark:bg-theme border-0 border-b-2"
          required
        />
      </div>
      <div className="flex flex-col">
        <Input
          data-testid="permlink-input"
          className="w-1/2 bg-theme dark:bg-theme border-0 border-b-2"
          type="text"
          value={permlink}
          onChange={(e) => setPermlink(e.target.value)}
          placeholder="Permlink *"
          required
        />
      </div>
      <div className="flex items-center my-2">
        <OperationTypesDialog
          operationTypes={operationsTypes?.filter((opType) =>
            config.commentOperationsTypeIds.includes(opType.op_type_id)
          )}
          selectedOperations={selectedCommentSearchOperationTypes}
          setSelectedOperations={setSelectedCommentSearchOperationTypes}
          buttonClassName="bg-buttonBg"
          triggerTitle={getOperationButtonTitle(
            selectedCommentSearchOperationTypes,
            operationsTypes
          )}
        />
      </div>
      <div className="flex items-center">
        <Button
          data-testid="search-button"
          className="mr-2 my-2"
          onClick={onButtonClick}
          disabled={!accountName || !permlink}
        >
          Search
          {loading && <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />}
        </Button>
        {!accountName && (
          <label className="text-gray-300 dark:text-gray-500 ">
            Set author name and permlink
          </label>
        )}
      </div>
    </>
  );
};

export default CommentsSearch;
