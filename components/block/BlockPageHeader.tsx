import { config } from "@/Config";
import { ChevronRightCircle, ChevronLeftCircle } from "lucide-react";
import moment from "moment";

interface BlockPageHeaderProps {
  blockNumber: number;
  nextBlock: () => void;
  prevBlock: () => void;
  timeStamp: Date;
  virtualOperationLength: number;
  nonVirtualOperationLength: number;
}

const BlockPageHeader: React.FC<BlockPageHeaderProps> = ({
  blockNumber,
  nextBlock,
  prevBlock,
  timeStamp,
  virtualOperationLength,
  nonVirtualOperationLength,
}) => {
  return (
    <section className="w-full flex flex-col items-center text-2xl">
      <div className="w-4/6 py-4 bg-explorer-dark-gray  text-center text-white">
        <p>
          Block Number :{" "}
          <span className="text-explorer-turquoise">{blockNumber}</span>
        </p>
        <div className="items-center m-3">
          <button
            onClick={prevBlock}
            className="text-white bg-transparent hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            <ChevronLeftCircle />
          </button>
          <button
            onClick={nextBlock}
            className="text-white bg-transparent hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            <ChevronRightCircle />
          </button>
        </div>
        <div className="items-center m-3">
          <p>
            Transactions :{" "}
            <span className="text-explorer-turquoise">
              {virtualOperationLength}
            </span>
          </p>
          <p>
            Virtual Operations :{" "}
            <span className="text-explorer-turquoise">
              {nonVirtualOperationLength}
            </span>
          </p>
          <p>
            Block Time :{" "}
            <span className="text-explorer-turquoise">{moment(timeStamp).format(config.baseMomentTimeFormat)}</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlockPageHeader;
