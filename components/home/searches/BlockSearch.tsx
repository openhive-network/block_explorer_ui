import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Select, SelectContent, SelectTrigger, SelectItem } from "@/components/ui/select";
import { Loader2, HelpCircle } from "lucide-react";
import useSearchRanges from "@/components/searchRanges/useSearchRanges";
import { useState } from "react";
import Hive from "@/types/Hive";
import { getOperationButtonTitle } from "@/utils/UI";
import useOperationKeys from "@/api/homePage/useOperationKeys";
import Explorer from "@/types/Explorer";
import { config } from "@/Config";

interface BlockSearchProps {
  startBlockSearch: (blockSearchProps: Explorer.BlockSearchProps) => Promise<void>
  operationsTypes?: Hive.OperationPattern[];
  loading?: boolean;
}

const BlockSearch: React.FC<BlockSearchProps> = ({startBlockSearch, operationsTypes, loading}) => {

  const [accountName, setAccountName] = useState<string >("");
  const [selectedOperationTypes, setSelectedOperationTypes] = useState<
    number[]
  >([]);
  const [singleOperationTypeId, setSingleOperationTypeId] = useState<
    number | undefined
  >(undefined);
  const [fieldContent, setFieldContent] = useState<string>(
    ""
  );
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(
    undefined
  );

  const searchRanges = useSearchRanges();
  const { operationKeysData } = useOperationKeys(singleOperationTypeId);
  const { getRangesValues } = searchRanges;

  const setKeysForProperty = (index: number | null) => {
    if (index !== null && operationKeysData?.[index]) {
      setSelectedKeys(operationKeysData[index]);
    } else {
      setSelectedKeys(undefined);
    }
  };

  const changeSelectedOperationTypes = (operationTypesIds: number[]) => {
    if (operationTypesIds.length === 1) {
      setSingleOperationTypeId(operationTypesIds[0]);
    } else {
      setFieldContent("");
      setSingleOperationTypeId(undefined);
    }
    setSelectedOperationTypes(operationTypesIds);
  };

  const onSelect = (newValue: string) => {
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
  }

  return (
    <AccordionItem value="block">
      <AccordionTrigger>Block Search</AccordionTrigger>
      <AccordionContent className="px-2 flex flex-col gap-y-4">
        <p className="ml-2">Find block numbers for given properties.</p>
        <div className="flex flex-col">
          <label className="ml-2">Account name</label>
          <Input
            className="w-1/2 md:w-1/3 bg-gray-700"
            type="text"
            value={accountName || ""}
            onChange={(e) =>
              setAccountName(
                e.target.value
              )
            }
            placeholder="---"
          />
        </div>
        <SearchRanges rangesProps={searchRanges} safeTimeRangeDisplay/>
        <div className="flex items-center">
          <OperationTypesDialog
            operationTypes={operationsTypes}
            selectedOperations={selectedOperationTypes}
            setSelectedOperations={changeSelectedOperationTypes}
            buttonClassName="bg-gray-500"
            triggerTitle={getOperationButtonTitle(selectedOperationTypes, operationsTypes)}
          />
        </div>
        <div className="flex flex-col ">
          <div className="flex items-center">
            <label className="ml-2">Property</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="bg-white text-black p-2">
                    Pick property from body of operation and its value.
                    You can use that only for single operation.
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex">
            <Select onValueChange={onSelect}>
              <SelectTrigger
                className="justify-normal bg-gray-700"
                disabled={
                  !selectedOperationTypes ||
                  selectedOperationTypes.length !== 1
                }
              >
                {selectedKeys && !!selectedKeys.length ? (
                  selectedKeys.map(
                    (key, index) =>
                      key !== "value" && (
                        <div
                          key={key}
                        >
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
              <SelectContent className="bg-white text-black rounded-sm max-h-[31rem] overflow-y-scroll">
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
                  setKeysForProperty(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="ml-2">Value</label>
          <Input
            className="w-1/2 bg-gray-700"
            type="text"
            value={fieldContent || ""}
            onChange={(e) => setFieldContent(e.target.value)}
            placeholder="---"
            disabled={
              !selectedOperationTypes ||
              selectedOperationTypes.length !== 1
            }
          />
        </div>
        <div className="flex items-center ">
          <Button
            className=" bg-blue-800 hover:bg-blue-600 rounded"
            onClick={onButtonClick}
          >
            <span>Search</span>{" "}
            {loading && (
              <Loader2 className="animate-spin h-4 w-4  ..." />
            )}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
};

export default BlockSearch;
