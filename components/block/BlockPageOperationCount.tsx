import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { getOperationTypeForDisplay } from "@/utils/UI";

interface BlockPageOperationCountProps {
  virtualOperationsTypesCounters?: Explorer.OperationCounter[];
  nonVirtualOperationsTypesCounters?: Explorer.OperationCounter[];
  virtualOperationLength: number;
  nonVirtualOperationLength: number;
}

const BlockPageOperationCount: React.FC<BlockPageOperationCountProps> = ({
  virtualOperationLength,
  nonVirtualOperationLength,
  virtualOperationsTypesCounters,
  nonVirtualOperationsTypesCounters,
}) => {
  return (
    <section className="w-full flex flex-col items-center text-md px-4 mb-2 md:mb-4">
      <div className="w-full py-4">
        <div className="my-2">Operations: {nonVirtualOperationLength}</div>
        <div className="flex flex-wrap flex-col md:flex-row text-sm">
          {nonVirtualOperationsTypesCounters && nonVirtualOperationsTypesCounters.map(
            ({operationTypeName, counter}) => (
              <div
                key={operationTypeName}
                className="flex justify-between p-2 md:w-1/2 border-b border-solid border-gray-700  border-r"
              >
                <span className="mr-2">{`${getOperationTypeForDisplay(
                  operationTypeName
                )}: `}</span>
                <span>{counter}</span>
              </div>
            )
          )}
        </div>
        <div className="my-2">Virtual operations: {virtualOperationLength}</div>
        <div className="flex flex-wrap flex-col md:flex-row text-sm">
          {virtualOperationsTypesCounters && virtualOperationsTypesCounters.map(
            ({operationTypeName, counter}) => (
              <div
                key={operationTypeName}
                className="flex justify-between p-2 md:w-1/2 border-b border-solid border-gray-700  border-r"
              >
                <span className="mr-2">{`${getOperationTypeForDisplay(
                  operationTypeName
                )}: `}</span>
                <span>{counter}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default BlockPageOperationCount;
