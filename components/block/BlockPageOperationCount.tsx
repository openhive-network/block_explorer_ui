import Explorer from "@/types/Explorer";
import { getOperationTypeForDisplay } from "@/utils/UI";
import { getOperationColor } from "../OperationsTable";

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
        <div className="flex flex-wrap justify-center text-sm">
          {nonVirtualOperationsTypesCounters &&
            nonVirtualOperationsTypesCounters.map(
              ({ operationTypeName, counter }) => (
                <div
                  key={operationTypeName}
                  className="flex p-2"
                >
                  <span
                    className={`rounded w-4 h-4 mr-2 mt-[2px] ${getOperationColor(
                      operationTypeName
                    )}`}
                  ></span>
                  <span className="mr-2">{`${getOperationTypeForDisplay(
                    operationTypeName
                  )}: `}</span>
                  <span>{counter}</span>
                </div>
              )
            )}
        </div>
        <div className="my-2">Virtual operations: {virtualOperationLength}</div>
        <div className="flex flex-wrap justify-center text-sm">
          {virtualOperationsTypesCounters &&
            virtualOperationsTypesCounters.map(
              ({ operationTypeName, counter }) => (
                <div
                  key={operationTypeName}
                  className="flex p-2"
                >
                  <span
                    className={`rounded w-4 h-4 mr-2 mt-[2px] ${getOperationColor(
                      operationTypeName
                    )}`}
                  ></span>
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
