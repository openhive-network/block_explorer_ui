import { useState } from "react";
import { Loader2 } from "lucide-react";

import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import useOperationKeys from "@/hooks/api/homePage/useOperationKeys";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { trimAccountName } from "@/utils/StringUtils";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import { useSearchesContext } from "@/contexts/SearchesContext";

import useBlockSearch from "@/hooks/api/homePage/useBlockSearch";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { startBlockSearch } from "./utils/blockSearchHelpers";

const BlockSearch = () => {
  const {
    blockSearchProps,
    setBlockSearchProps,
    setLastSearchKey,
    searchRanges,
  } = useSearchesContext();
  const { operationsTypes } = useOperationsTypes();

  const { blockSearchDataLoading } = useBlockSearch(blockSearchProps);

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

  const handleStartBlockSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await getRangesValues();
    const blockSearchProps: Explorer.BlockSearchProps = {
      accountName:
        accountName !== "" ? trimAccountName(accountName) : undefined,
      operationTypes: selectedOperationTypes.length
        ? selectedOperationTypes
        : undefined,
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

    startBlockSearch(blockSearchProps, setBlockSearchProps, (val: "block") =>
      setLastSearchKey(val)
    );
  };

  return (
    <>
      <div className="flex flex-col">
        <AutocompleteInput
          value={accountName}
          onChange={setAccountName}
          placeholder="Account name"
          inputType="account_name"
          className="w-1/2 bg-theme border-0 border-b-2"
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
      {/*TODO: Hide this for now, NOT REMOVE IT. It will be moved to search operation seaction when BE is done */}
      {/* <div className="flex flex-col "> */}
      {/* <div className="flex mb-4 items-center">
          <label>Property</label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="bg-theme text-text p-2">
                  Pick property from body of operation and its value. You can
                  use that only for single operation.
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div> */}
      {/* <div className="flex">
          <Select
            onValueChange={onSelect}
            value={selectedIndex}
          >
            <SelectTrigger
              className="w-1/2 pb-6 justify-normal bg-theme border-0 border-b-2 "
              disabled={
                !selectedOperationTypes || selectedOperationTypes.length !== 1
              }
            >
              {selectedKeys && !!selectedKeys.length ? (
                selectedKeys.map(
                  (key, index) =>
                    key !== "value" && (
                      <div key={`key ${index}`}>
                        {index !== 1 && "/"} {key}
                      </div>
                    )
                )
              ) : (
                <div className="text-text">
                  {!selectedOperationTypes ||
                  selectedOperationTypes.length !== 1
                    ? "Select exactly 1 operation to use key-value search"
                    : "Pick a property"}{" "}
                </div>
              )}
            </SelectTrigger>
            <SelectContent className="rounded-sm max-h-[31rem] overflow-y-scroll">
              {operationKeysData?.map((keys, index) => (
                <SelectItem
                  className="m-1 text-center"
                  key={index}
                  value={index.toFixed(0)}
                  defaultChecked={false}
                >
                  <div className="flex gap-x-2">
                    {keys.map(
                      (key, index) =>
                        key !== "value" && (
                          <div key={`key ${index}`}>
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
      </div> */}
      {/* <div className="flex flex-col">
        <Input
          className="w-1/2 border-0 border-b-2 bg-theme text-text"
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
      </div> */}
      <div className="flex items-center ">
        <Button
          data-testid="block-search-btn"
          onClick={handleStartBlockSearch}
        >
          Search
          {blockSearchDataLoading && (
            <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />
          )}
        </Button>
      </div>
    </>
  );
};

export default BlockSearch;
