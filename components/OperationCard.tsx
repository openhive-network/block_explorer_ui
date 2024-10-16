import { config } from "@/Config";
import Hive from "@/types/Hive";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import moment from "moment";
import Link from "next/link";

interface OperationCardProps {
  operation: Hive.Operation;
  blockNumber: number;
  transactionId: string;
  date: Date;
  isVirtual: boolean;
}

const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  blockNumber,
  transactionId,
  date,
  isVirtual,
}) => {
  return (
    <div className="mt-6 w-full bg-theme dark:bg-theme px-4 py-2 rounded text-xs	overflow-hidden">
      <div className="flex justify-center text-xl text-explorer-orange mb-4">
        {operation.type}
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col">
          {!isVirtual && (
            <div className="my-1">
              Trx{" "}
              <Link
                className="text-explorer-turquoise"
                href={`/transaction/${transactionId}`}
              >
                {transactionId.slice(0, 10)}
              </Link>
            </div>
          )}

          <div className="my-1">
            Block{" "}
            <Link
              className="text-explorer-turquoise"
              href={`/block/${blockNumber}`}
            >
              {blockNumber}
            </Link>
          </div>
          <div className="my-1">
            Date:{" "}
            <span className="text-explorer-turquoise">
              {formatAndDelocalizeTime(date)}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          {Object.entries(operation.value).map(([key, property]) => (
            <div key={key}>{`${key}: ${JSON.stringify(property)}`}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OperationCard;
