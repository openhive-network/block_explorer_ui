import Hive from "@/types/Hive";
import moment from "moment";

interface OperationCardProps {
  operation: Hive.Operation;
  blockNumber: number;
  transactionId: string;
  date: string;
}

const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  blockNumber,
  transactionId,
  date,
}) => {
  return (
    <div className="mt-6 w-full bg-explorer-dark-gray px-4 py-2 rounded-[6px] text-xs	">
      <div className="flex justify-center text-xl text-explorer-orange mb-4">
        {operation.type}
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col">
          <div>
            Trx{" "}
            <span className="text-explorer-turquoise">
              {transactionId
                ? transactionId.slice(0, 10)
                : JSON.stringify(transactionId)}
            </span>
          </div>
          <div>
            Block <span className="text-explorer-turquoise">{blockNumber}</span>
          </div>
          <div>
            Date:{" "}
            <span className="text-explorer-turquoise">
              {moment(date).format("DD/MM/YYYY hh:mm:ss")}
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
