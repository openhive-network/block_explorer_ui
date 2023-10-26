import { ChevronRight, ChevronLeft } from "lucide-react";
import fetchingService from "@/services/FetchingService";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import Hive from "@/types/Hive";
import OperationTypesDialog from "./OperationTypesDialog";
import Link from "next/link";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

interface BlockPageNavigationProps {
  blockNumber: number;
  goToBlock: (blockNumber: string) => void;
  timeStamp: Date;
  virtualOperationLength?: number;
  nonVirtualOperationLength?: number;
  setFilters: Dispatch<SetStateAction<number[]>>;
  operationTypes: Hive.OperationPattern[];
  selectedOperationIds: number[];
  isLoading: boolean;
  blockDetails?: Hive.BlockDetails;
}

const BlockPageNavigation: React.FC<BlockPageNavigationProps> = ({
  blockNumber,
  goToBlock,
  timeStamp,
  virtualOperationLength,
  nonVirtualOperationLength,
  setFilters,
  operationTypes,
  selectedOperationIds,
  isLoading,
  blockDetails,
}) => {
  const [block, setBlock] = useState(blockNumber.toString());
  const [blockDate, setBlockDate] = useState(
    new Date(timeStamp.toLocaleDateString("en-US"))
  );

  useEffect(() => {
    setBlockDate(timeStamp);
  }, [timeStamp]);

  useEffect(() => {
    setBlock(blockNumber.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleBlockChange = (blockNumber: string) => {
    if (Number(blockNumber) > 0) {
      if (blockNumber === block) {
        setBlockDate(timeStamp);
      }
      goToBlock(blockNumber);
      setBlock(blockNumber);
    }
  };

  const handleGoToBlockByTime = async () => {
    const blockByTime = await fetchingService.getBlockByTime(
      new Date(blockDate.toUTCString())
    );
    if (blockByTime) {
      handleBlockChange(blockByTime.toString());
    }
  };

  return (
    <section className="w-full flex flex-col items-center text-md px-4 mb-2 md:mb-4">
      <div className="w-full md:w-4/6 py-4 bg-explorer-dark-gray text-center text-white rounded-[6px] shadow-xl border border-explorer-bg-start">
        <div className="w-full flex justify-evenly items-center md:px-8 flex-wrap gap-y-4">
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
            />
            <button
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
          <div className="flex flex-wrap items-center justify-center">
            Block Time :{" "}
            <DateTimePicker
              value={blockDate}
              onChange={(date) => setBlockDate(date!)}
              className="text-explorer-turquoise ml-2 md:ml-4 border border-explorer-turquoise"
              calendarClassName="text-gray-800"
              format="yyyy/MM/dd HH:mm:ss"
              clearIcon={null}
              calendarIcon={null}
              disableClock
              showLeadingZeros={false}
            />
            <Button
              variant={"outline"}
              className="px-2 h-[30px]"
              disabled={timeStamp.getTime() === blockDate.getTime()}
              onClick={() => handleGoToBlockByTime()}
            >
              Go
            </Button>
          </div>
        </div>
        <div className="mt-3 mx-auto">
          <p className="inline-block">
            Operations : <span>{!isLoading && nonVirtualOperationLength}</span>
          </p>
          <p className="ml-4 inline-block">
            Virtual Operations :{" "}
            <span>{!isLoading && virtualOperationLength}</span>
          </p>
          <p className="ml-4 inline-block">
            <OperationTypesDialog
              operationTypes={operationTypes}
              setSelectedOperations={setFilters}
              selectedOperations={selectedOperationIds}
              colorClass="bg-gray-500"
              triggerTitle={"Operation Filters"}
            />
          </p>
        </div>
        <div className="flex items-center gap-x-1 mt-3 px-8 md:px-4 w-full justify-center">
          <p>Produced at: </p>
          <p>{blockDetails?.created_at}</p>
          <p>by</p>
          <Link
            className="flex justif-between items-center"
            href={`/account/${blockDetails?.producer_account}`}
          >
            <span className="text-explorer-turquoise mx-2">
              {blockDetails?.producer_account}
            </span>
            <Image
              className="rounded-full border-2 border-explorer-turquoise"
              src={getHiveAvatarUrl(blockDetails?.producer_account)}
              alt="avatar"
              width={40}
              height={40}
            />
          </Link>
        </div>
        <div className="flex items-center gap-x-4 mt-3 px-8 md:px-4 w-full justify-center flex-wrap text-sm md:text-base">
          <p>
            <p className="text-base">Hash</p>
            {blockDetails?.hash}
          </p>
          <p>
            <p className="text-base">Prev hash</p>
            {blockDetails?.prev}
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlockPageNavigation;
