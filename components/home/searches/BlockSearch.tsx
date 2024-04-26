import { Input } from "@/components/ui/input";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, HelpCircle } from "lucide-react";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";
import { useState } from "react";
import Hive from "@/types/Hive";
import { getOperationButtonTitle } from "@/utils/UI";
import useOperationKeys from "@/api/homePage/useOperationKeys";
import Explorer from "@/types/Explorer";
import { config } from "@/Config";

interface BlockSearchProps {
  startBlockSearch: (
    blockSearchProps: Explorer.BlockSearchProps
  ) => Promise<void>;
  operationsTypes?: Hive.OperationPattern[];
  loading?: boolean;
}

const BlockSearch: React.FC<BlockSearchProps> = ({
  startBlockSearch,
  operationsTypes,
  loading,
}) => {
  const [accountName, setAccountName] = useState<string>("");
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<
    number[]
  >([]);
  const [singleOperationTypeId, setSingleOperationTypeId] = useState<
    number | undefined
  >(undefined);
  const [fieldContent, setFieldContent] = useState<string>("");
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(
    undefined
  );
  const [selectedIndex, setSelectedIndex] = useState<string>("");

  const searchRanges = useSearchRanges("lastBlocks");
  const { operationKeysData } = useOperationKeys(singleOperationTypeId);
  const { getRangesValues } = searchRanges;

  const setKeysForProperty = (index: number | undefined) => {
    if (index !== undefined && operationKeysData?.[index]) {
      setSelectedKeys(operationKeysData[index]);
    } else {
      setSelectedKeys(undefined);
      setSelectedIndex("");
      setFieldContent("");
    }
  };

  const changeSelectedOperationTypes = (operationTypesIds: number[]) => {
    if (operationTypesIds.length === 1) {
      setSingleOperationTypeId(operationTypesIds[0]);
    } else {
      setSingleOperationTypeId(undefined);
    }
    setSelectedKeys(undefined);
    setFieldContent("");
    setSelectedOperationTypes(operationTypesIds);
  };

  const onSelect = (newValue: string) => {
    setSelectedIndex(newValue);
    setKeysForProperty(Number(newValue));
  };

  const onButtonClick = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await getRangesValues();
    const blockSearchProps: Explorer.BlockSearchProps = {
      accountName: accountName !== "" ? accountName : undefined,
      operationTypes: selectedOperationTypes.length
        ? selectedOperationTypes
        : operationsTypes?.map((opType) => opType.op_type_id),
      fromBlock: payloadFromBlock,
      toBlock: payloadToBlock,
      startDate: payloadStartDate,
      endDate: payloadEndDate,
      limit: config.standardPaginationSize,
      deepProps: {
        keys: selectedKeys,
        content: fieldContent !== "" ? fieldContent : undefined,
      },
    };
    startBlockSearch(blockSearchProps);
  };

  return (
    <>
      <div className="flex flex-col">
        <Input
          className="w-1/2 bg-explorer-dark-gray border-0 border-b-2"
          type="text"
          placeholder="Account name"
          value={accountName || ""}
          onChange={(e) => setAccountName(e.target.value)}
          data-testid="account-name-input"
        />
      </div>
      <SearchRanges
        rangesProps={searchRanges}
        safeTimeRangeDisplay
      />
      <div className="flex items-center">
        <OperationTypesDialog
          operationTypes={operationsTypes}
          selectedOperations={selectedOperationTypes}
          setSelectedOperations={changeSelectedOperationTypes}
          buttonClassName="bg-gray-500"
          triggerTitle={getOperationButtonTitle(
            selectedOperationTypes,
            operationsTypes
          )}
        />
      </div>
      <div className="flex flex-col ">
        <div className="flex mb-4 items-center">
          <label>Property</label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="bg-white text-black dark:bg-explorer-dark-gray dark:text-white p-2">
                  Pick property from body of operation and its value. You can
                  use that only for single operation.
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex">
          <Select
            onValueChange={onSelect}
            value={selectedIndex}
          >
            <SelectTrigger
              className="w-1/2 justify-normal bg-exolorer-dark-gray border-0 border-b-2 "
              disabled={
                !selectedOperationTypes || selectedOperationTypes.length !== 1
              }
            >
              {selectedKeys && !!selectedKeys.length ? (
                selectedKeys.map(
                  (key, index) =>
                    key !== "value" && (
                      <div key={key}>
                        {index !== 1 && "/"} {key}
                      </div>
                    )
                )
              ) : (
                <div className="text-blocked">
                  {!selectedOperationTypes ||
                  selectedOperationTypes.length !== 1
                    ? "Select exactly 1 operation to use key-value search"
                    : "Pick a property"}{" "}
                </div>
              )}
            </SelectTrigger>
            <SelectContent className="bg-white text-black dark:bg-explorer-dark-gray dark:text-white rounded-sm max-h-[31rem] overflow-y-scroll">
              {operationKeysData?.map((keys, index) => (
                <SelectItem
                  className="m-1 text-center hover:bg-explorer-dark-gray hover:text-white hover:dark:bg-white hover:dark:text-black hover:cursor-pointer"
                  key={index}
                  value={index.toFixed(0)}
                  defaultChecked={false}
                >
                  <div className="flex gap-x-2">
                    {keys.map(
                      (key, index) =>
                        key !== "value" && (
                          <div key={key}>
                            {index !== 1 && "/"} {key}{" "}
                          </div>
                        )
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedKeys && !!selectedKeys.length && (
            <Button
              onClick={() => {
                setKeysForProperty(undefined);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <Input
          className="w-1/2 border-0 border-b-2 bg-explorer-dark-gray"
          type="text"
          value={fieldContent || ""}
          onChange={(e) => setFieldContent(e.target.value)}
          placeholder="Value"
          disabled={
            !selectedOperationTypes ||
            selectedOperationTypes.length !== 1 ||
            !selectedKeys ||
            !selectedKeys.length
          }
        />
      </div>
      <div className="flex items-center ">
        <Button
          data-testid="block-search-btn"
          className=" bg-blue-800 hover:bg-blue-600 rounded"
          onClick={onButtonClick}
        >
          Search
          {loading && <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />}
        </Button>
      </div>
    </>
  );
};

export default BlockSearch;
