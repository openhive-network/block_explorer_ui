import Explorer from "@/types/Explorer";
import { getOperationTypeForDisplay } from "@/utils/UI";
import { getOperationColor } from "../OperationsTable";
import { Toggle } from "../ui/toggle";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";

interface BlockPageOperationCountProps {
  virtualOperationsTypesCounters?: Explorer.OperationCounter[];
  nonVirtualOperationsTypesCounters?: Explorer.OperationCounter[];
  virtualOperationLength: number;
  nonVirtualOperationLength: number;
  enableRawVirtualOperations: boolean;
  handleEnableVirtualOperations: () => void;
}

const BlockPageOperationCount: React.FC<BlockPageOperationCountProps> = ({
  virtualOperationLength,
  nonVirtualOperationLength,
  virtualOperationsTypesCounters,
  nonVirtualOperationsTypesCounters,
  enableRawVirtualOperations,
  handleEnableVirtualOperations,
}) => {
  const { settings } = useUserSettingsContext();

  const isRawView = settings.rawJsonView || settings.prettyJsonView;
  return (
    <section className="w-full flex flex-col items-center text-md px-4 mb-2 md:mb-4">
      <div className="w-full py-4">
        <div className="my-5 flex justify-center ">
          Operations: {nonVirtualOperationLength}
        </div>
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
        <div className="my-5 flex justify-center">
          Virtual operations: {virtualOperationLength}
          {isRawView && (
            <div className="flex justify-center items-center">
              <span className="ml-2">
                <Toggle
                  checked={enableRawVirtualOperations}
                  onClick={handleEnableVirtualOperations}
                />
              </span>
            </div>
          )}
        </div>
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
