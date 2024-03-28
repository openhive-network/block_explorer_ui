import { useEffect, useState, useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Hive from "@/types/Hive";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import useBlockByTime from "@/api/common/useBlockByTime";
import moment from "moment";
import { getOperationButtonTitle } from "@/utils/UI";
import {
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import DateTimePicker from "../DateTimePicker";

interface BlockPageNavigationProps {
  blockNumber: number;
  goToBlock: (blockNumber: string) => void;
  timeStamp: Date | undefined;
  setFilters: (filters: boolean[]) => void;
  operationTypes: Hive.OperationPattern[];
  selectedOperationIds: boolean[];
}

const BlockPageNavigation: React.FC<BlockPageNavigationProps> = ({
  blockNumber,
  goToBlock,
  timeStamp,
  setFilters,
  operationTypes,
  selectedOperationIds,
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
      if (event.code === "Enter") {
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
        setBlockDate(timeStamp);
      }
      goToBlock(blockNumber);
      setBlock(blockNumber);
    }
  };

  const handleGoToBlockByTime = async (date: Date | undefined) => {
    if (date?.getTime() !== timeStamp?.getTime()) {
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
    <section className="w-full flex flex-col items-center text-md mb-2 md:mb-4">
      <div
        className="w-full md:w-4/6 pb-4 bg-explorer-dark-gray text-center text-white rounded shadow-xl border border-explorer-bg-start"
        data-testid="block-page-search"
      >
        <div className="text-2xl font-semibold my-2">Search</div>
        <div className="w-full flex justify-between items-center px-2 md:px-8 flex-wrap gap-y-4">
          <div className="flex justify-center items-center flex-wrap">
            <p>Block Number : </p>
            <button
              onClick={() => handleBlockChange((blockNumber - 1).toString())}
              className="text-white bg-transparent ml-2 md:ml-4 text-sm border border-white h-[30px] md:px-1"
            >
              <ChevronLeft />
            </button>
            <Input
              className="max-w-[100px] py-0 h-[30px] md:max-w-[112px] text-explorer-turquoise text-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              type="number"
              data-testid="block-number-search"
            />
            <button
              data-testid="next-block-btn"
              onClick={() => handleBlockChange((blockNumber + 1).toString())}
              className="text-white bg-transparent text-sm border border-white h-[30px] md:px-1"
            >
              <ChevronRight />
            </button>
            <Button
              variant={"outline"}
              className="px-2 h-[30px]"
              disabled={Number(block) === blockNumber}
              onClick={() => handleBlockChange(block)}
            >
              Go
            </Button>
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
          <OperationTypesDialog
            operationTypes={operationTypes}
            setSelectedOperations={handleSetFilters}
            selectedOperations={convertBooleanArrayToIds(selectedOperationIds)}
            buttonClassName="bg-gray-500"
            triggerTitle={getOperationButtonTitle(
              convertBooleanArrayToIds(selectedOperationIds),
              operationTypes
            )}
          />
        </div>
      </div>
    </section>
  );
};

export default BlockPageNavigation;
