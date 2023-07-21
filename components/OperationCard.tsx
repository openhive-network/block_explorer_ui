import Explorer from "@/types/Explorer";
import { addSpacesAndCapitalizeFirst } from "@/utils/StringUtils";

interface OperationCardProps {
  operation: Explorer.Operation;
  blockNumber: number;
  transactionId: string | null;
  age: string;
  expiration?: string;
}

const getOperationDetailsHeader = (operation: Explorer.Operation) => {
  switch (operation.type) {
    case "vote_operation":
      return (
        <span>
          <span className="text-explorer-red">{operation.value.voter}</span>,
          author:{" "}
          <span className="text-explorer-red">{operation.value.author}</span>,
          permlink:{" "}
          <span className="text-explorer-ligh-green">
            {operation.value.permlink}
          </span>
        </span>
      );
      break;

    case "comment_operation":
      return (
        <span>
          <span className="text-explorer-red">{operation.value.author}</span>{" "}
          commented:{" "}
          <span className="text-explorer-red">
            {operation.value.parent_author}
          </span>
          {"'"}s permlink:{" "}
          <span className="text-explorer-ligh-green">
            {operation.value.permlink}
          </span>
        </span>
      );
      break;

    default:
      return (
        <span>
          <span className="text-explorer-red">
            {operation.value.author ?? "No value found"}
          </span>{" "}
          commented:{" "}
          <span className="text-explorer-red">
            {operation.value.parent_author ?? "No value found"}
          </span>
          {"'"}s permlink:{" "}
          <span className="text-explorer-ligh-green">
            {operation.value.permlink ?? "No value found"}
          </span>
        </span>
      );
      break;
  }
};

const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  age,
  blockNumber,
  expiration,
  transactionId,
}) => {
  return (
    <div className="mt-6 w-full bg-explorer-dark-gray px-4 py-2 rounded-[6px]">
      <div className="flex justify-center text-3xl text-explorer-orange">
        {addSpacesAndCapitalizeFirst(operation.type)}
      </div>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <div>
            Trx{" "}
            <span className="text-explorer-turquoise">
              {transactionId ? transactionId.slice(0, 10) : "null"}
            </span>
          </div>
          <div>{expiration ?? ""}</div>
        </div>
        <div className="flex justify-between">
          <div>
            Block <span className="text-explorer-turquoise">{blockNumber}</span>
          </div>
          <div>{age}</div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-4">
        {getOperationDetailsHeader(operation)}
      </div>
    </div>
  );
};

export default OperationCard;
