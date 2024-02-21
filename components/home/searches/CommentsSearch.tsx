import { Input } from "@/components/ui/input";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";
import { useEffect, useState } from "react";
import Hive from "@/types/Hive";
import { getOperationButtonTitle } from "@/utils/UI";
import Explorer from "@/types/Explorer";
import { config } from "@/Config";
import { formatAccountName } from "@/utils/StringUtils";

interface CommentsSearchProps {
  startCommentsSearch: (
    accountSearchOperationsProps: Explorer.CommentSearchParams
  ) => Promise<void>;
  operationsTypes?: Hive.OperationPattern[];
  data?: Explorer.CommentSearchParams;
  loading?: boolean;
}

const CommentsSearch: React.FC<CommentsSearchProps> = ({
  startCommentsSearch,
  operationsTypes,
  loading,
  data,
}) => {
  const [accountName, setAccountName] = useState<string>("");
  const [permlink, setPermlink] = useState<string>("");
  const [
    selectedCommentSearchOperationTypes,
    setSelectedCommentSearchOperationTypes,
  ] = useState<number[]>([]);

  const searchRanges = useSearchRanges("lastBlocks");
  const { getRangesValues } = searchRanges;

  const setSearchValues = (data: Explorer.CommentSearchParams) => {
    data.accountName && setAccountName(data.accountName);
    data.permlink && setPermlink(data.permlink);
    data.operationTypes &&
      setSelectedCommentSearchOperationTypes(data.operationTypes);
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
        accountName,
        permlink: permlink !== "" ? permlink : undefined,
        fromBlock: payloadFromBlock,
        toBlock: payloadToBlock,
        startDate: payloadStartDate,
        endDate: payloadEndDate,
        operationTypes: selectedCommentSearchOperationTypes.length
          ? selectedCommentSearchOperationTypes
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
        <label className="ml-2">Account name *</label>
        <Input
          data-testid="account-name"
          className="w-1/2 md:w-1/3 bg-gray-700"
          type="text"
          value={formatAccountName(accountName)}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="---"
        />
      </div>
      <div className="flex flex-col">
        <label className="ml-2">Permlink</label>
        <Input
          data-testid="permlink-input"
          className="w-full bg-gray-700"
          type="text"
          value={permlink}
          onChange={(e) => setPermlink(e.target.value)}
          placeholder="---"
        />
      </div>
      <SearchRanges rangesProps={searchRanges} safeTimeRangeDisplay />
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
          className=" bg-blue-800 hover:bg-blue-600 rounded"
          onClick={onButtonClick}
          disabled={!accountName}
        >
          <span>Search</span>{" "}
          {loading && <Loader2 className="animate-spin h-4 w-4  ..." />}
        </Button>
        {!accountName && (
          <label className=" text-muted-foreground">Set account name</label>
        )}
      </div>
    </>
  );
};

export default CommentsSearch;
