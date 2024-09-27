import { useEffect, useState, useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import moment from "moment";

import Hive from "@/types/Hive";
import { getOperationButtonTitle } from "@/utils/UI";
import {
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import useBlockByTime from "@/hooks/api/common/useBlockByTime";

import DateTimePicker from "../DateTimePicker";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface BlockPageNavigationProps {
  blockNumber: number;
  goToBlock: (blockNumber: string) => void;
  timeStamp: Date | undefined;
  setFilters: (filters: boolean[]) => void;
  operationTypes: Hive.OperationPattern[];
  selectedOperationIds: boolean[];
  accountName?: string;
  keyContent?: string;
  setOfKeys?: string[];
  onClearParams: () => void;
}

const BlockPageNavigation: React.FC<BlockPageNavigationProps> = ({
  blockNumber,
  goToBlock,
  timeStamp,
  setFilters,
  operationTypes,
  selectedOperationIds,
  accountName,
  keyContent,
  setOfKeys,
  onClearParams,
}) => {
  const [block, setBlock] = useState(blockNumber.toString());
  const [blockDate, setBlockDate] = useState(timeStamp);

  const { checkBlockByTime } = useBlockByTime();

  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (datePickerRef && datePickerRef.current) {
      datePickerRef.current.addEventListener("contextmenu", (e) =>
        e.preventDefault()
      );
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      datePickerRef?.current?.removeEventListener("contextmenu", (e) =>
        e.preventDefault()
      );
    };
  }, []);

  useEffect(() => {
    setBlockDate(timeStamp);
  }, [timeStamp]);

  useEffect(() => {
    setBlock(blockNumber.toString());
  }, [blockNumber]);

  useEffect(() => {
    const keyDownEvent = (event: KeyboardEvent) => {
      if (event.code === "Enter" && Number(block) !== blockNumber) {
        handleBlockChange(block);
      }
    };

    document.addEventListener("keydown", keyDownEvent);
    return () => {
      document.removeEventListener("keydown", keyDownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block]);

  useEffect(() => {
    handleGoToBlockByTime(blockDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockDate]);

  const handleBlockChange = (blockNumber: string) => {
    if (Number(blockNumber) > 0) {
      if (blockNumber === block) {
        if (timeStamp) setBlockDate(timeStamp);
      }
      goToBlock(blockNumber);
      setBlock(blockNumber);
    }
  };

  const handleGoToBlockByTime = async (date: Date | undefined) => {
    if (date && date?.getTime() !== timeStamp?.getTime()) {
      const blockByTime = await checkBlockByTime(moment(date).utc().toDate());
      if (blockByTime) {
        handleBlockChange(blockByTime.toString());
      }
    }
  };

  const handleSetFilters = (filters: number[]) => {
    setFilters(convertIdsToBooleanArray(filters));
  };

  return (
    <Card
      className="w-full md:max-w-screen-2xl md:px-2 m-auto"
      data-testid="block-page-search"
    >
      <CardHeader>
        <CardTitle>Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full flex justify-around items-center flex-wrap gap-y-4">
          <div className="flex justify-center items-center flex-wrap">
            <p>Block Number : </p>
            <button
              onClick={() => handleBlockChange((blockNumber - 1).toString())}
              className="text-white bg-transparent text-sm border-0 h-[30px] md:px-1 hover:bg-gray-700 ml-2"
            >
              <ChevronLeft />
            </button>
            <Input
              className="max-w-[110px] py-0 mx-2 h-[30px] border-0 border-b-2 text-explorer-turquoise  text-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              type="number"
              min="0"
              data-testid="block-number-search"
            />
            <button
              data-testid="next-block-btn"
              onClick={() => handleBlockChange((blockNumber + 1).toString())}
              className="text-white bg-transparent text-sm border-0 h-[30px] md:px-1 hover:bg-gray-700 "
            >
              <ChevronRight />
            </button>
          </div>
          <div
            className="flex flex-wrap items-center justify-center"
            ref={datePickerRef}
          >
            <p> Block Time : </p>
            <div className="ml-2">
              <DateTimePicker
                date={blockDate || new Date()}
                setDate={setBlockDate}
              />
            </div>
          </div>
          <div className="flex">
            <OperationTypesDialog
              operationTypes={operationTypes}
              setSelectedOperations={handleSetFilters}
              selectedOperations={convertBooleanArrayToIds(
                selectedOperationIds
              )}
              buttonClassName="bg-gray-500"
              triggerTitle={getOperationButtonTitle(
                convertBooleanArrayToIds(selectedOperationIds),
                operationTypes
              )}
            />
          </div>
        </div>

        {(!!accountName || !!keyContent || !!setOfKeys) && (
          <div className="w-full flex justify-between items-center px-2 md:px-8 flex-wrap gap-y-4 mt-4">
            <div className="flex gap-x-6">
              {!!keyContent && <div>Key content: {keyContent}</div>}
              {!!setOfKeys && <div>Set of keys: {setOfKeys.join(", ")}</div>}
              {!!accountName && <div>Account: {accountName}</div>}
            </div>
            <Button
              onClick={onClearParams}
              variant="outline"
            >
              Clear params
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockPageNavigation;
