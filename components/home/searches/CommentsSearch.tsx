import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";
import { useState } from "react";
import Hive from "@/types/Hive";
import { getOperationButtonTitle } from "@/utils/UI";
import Explorer from "@/types/Explorer";
import { config } from "@/Config";

interface CommentsSearchProps {
  startCommentsSearch: (
    accountSearchOperationsProps: Explorer.CommentSearchProps
  ) => Promise<void>;
  operationsTypes?: Hive.OperationPattern[];
  loading?: boolean;
}

const CommentsSearch: React.FC<CommentsSearchProps> = ({
  startCommentsSearch,
  operationsTypes,
  loading,
}) => {
  const [accountName, setAccountName] = useState<string>("");
  const [permlink, setPermlink] = useState<string>("");
  const [
    selectedCommentSearchOperationTypes,
    setSelectedCommentSearchOperationTypes,
  ] = useState<number[]>([]);

  const searchRanges = useSearchRanges();
  const { getRangesValues } = searchRanges;
  
  const onButtonClick = async () => {
    if (accountName !== "") {
      const {
        payloadFromBlock,
        payloadToBlock,
        payloadStartDate,
        payloadEndDate,
      } = await getRangesValues();
  
      const commentSearchProps: Explorer.CommentSearchProps = {
        accountName,
        permlink: permlink !== "" ? permlink : undefined,
        fromBlock: payloadFromBlock,
        toBlock: payloadToBlock,
        startDate: payloadStartDate,
        endDate: payloadEndDate,
        operationTypes: selectedCommentSearchOperationTypes.length
          ? selectedCommentSearchOperationTypes
          : undefined,
      };
      startCommentsSearch(commentSearchProps);
    }
  };


  return (
    <AccordionItem value="comment">
      <AccordionTrigger>Comment search</AccordionTrigger>
      <AccordionContent className="px-2 flex flex-col gap-y-4">
        <p className="ml-2">
          Find all operations related to comments of given account or for exact
          permlink.
        </p>
        <div className="flex flex-col">
          <label className="ml-2">Account name *</label>
          <Input
            className="w-1/2 md:w-1/3 bg-gray-700"
            type="text"
            value={accountName || ""}
            onChange={(e) =>
              setAccountName(e.target.value)
            }
            placeholder="---"
          />
        </div>
        <div className="flex flex-col">
          <label className="ml-2">Permlink</label>
          <Input
            className="w-full bg-gray-700"
            type="text"
            value={permlink}
            onChange={(e) =>
              setPermlink(e.target.value)
            }
            placeholder="---"
          />
        </div>
        <SearchRanges rangesProps={searchRanges} />
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
            className=" bg-blue-800 hover:bg-blue-600 rounded"
            onClick={onButtonClick}
            disabled={!accountName}
          >
            <span>Search</span>{" "}
            {loading && (
              <Loader2 className="animate-spin h-4 w-4  ..." />
            )}
          </Button>
          {!accountName && (
            <label className=" text-muted-foreground">Set account name</label>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CommentsSearch;
