import { ChevronRightCircle, ChevronLeftCircle } from "lucide-react";
import fetchingService from "@/services/FetchingService";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import DateTimePicker from "react-datetime-picker";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

interface BlockPageNavigationProps {
  blockNumber: number;
  goToBlock: (blockNumber: string) => void;
  timeStamp: Date;
  virtualOperationLength: number;
  nonVirtualOperationLength: number;
}

const BlockPageNavigation: React.FC<BlockPageNavigationProps> = ({
  blockNumber,
  goToBlock,
  timeStamp,
  virtualOperationLength,
  nonVirtualOperationLength,
}) => {
  const [block, setBlock] = useState(blockNumber.toString());
  const [blockDate, setBlockDate] = useState(timeStamp);

  const handleBlockChange = (blockNumber: string) => {
    goToBlock(blockNumber);
    setBlock(blockNumber);
  };

  const handleGoToBlockByTime = async () => {
    const blockByTime = await fetchingService.getBlockByTime(new Date(blockDate.toString() + "Z"));
    if (blockByTime) {
      handleBlockChange(blockByTime.num.toString());
    }
  };

  return (
    <section className="w-full flex flex-col items-center text-2xl p-4 sticky top-0">
      <div className="w-full md:w-4/6 py-4 bg-explorer-dark-gray text-center text-white rounded-[6px] shadow-xl">
        <div className="w-full flex justify-between items-center px-8">
          <button
            onClick={() => handleBlockChange((blockNumber - 1).toString())}
            className="text-white bg-transparent hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            <ChevronLeftCircle />
          </button>
          <div className="flex justify-center items-center flex-wrap">
            <p>Block Number : </p>
            <Input
              className="max-w-[150px] md:max-w-[200px] md:ml-4 text-explorer-turquoise text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              type="number"
            />
            <Button
              variant={"outline"}
              disabled={Number(block) === blockNumber}
              onClick={() => handleBlockChange(block)}
            >
              Go
            </Button>
          </div>
          <button
            onClick={() => handleBlockChange((blockNumber + 1).toString())}
            className="text-white bg-transparent hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            <ChevronRightCircle />
          </button>
        </div>
        <div className="items-center m-3">
          <p>
            Operations :{" "}
            <span className="text-explorer-turquoise">
              {nonVirtualOperationLength}
            </span>
          </p>
          <p>
            Virtual Operations :{" "}
            <span className="text-explorer-turquoise">
              {virtualOperationLength}
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center w-full mt-3">
            Block Time :{" "}
            <DateTimePicker
              value={blockDate}
              onChange={(date) => setBlockDate(date!)}
              className="text-explorer-turquoise md:ml-4 border border-explorer-turquoise"
              calendarClassName="text-gray-800"
              format="dd/MM/yyyy hh:mm:ss aa"
              clearIcon={null}
              calendarIcon={null}
              disableClock
              showLeadingZeros={false}
            />
            <Button
              variant={"outline"}
              disabled={timeStamp.getTime() === blockDate.getTime()}
              onClick={() => handleGoToBlockByTime()}
            >
              Go
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlockPageNavigation;
