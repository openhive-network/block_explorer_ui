// BlockPageOperationCount.tsx
import Explorer from "@/types/Explorer";
import { getOperationTypeForDisplay } from "@/utils/UI";
import { getOperationColor } from "../OperationsTable";
import { Toggle } from "../ui/toggle";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";

interface BlockPageOperationCountProps {
  virtualOperationsTypesCounters?: Explorer.OperationCounter[];
  nonVirtualOperationsTypesCounters?: Explorer.OperationCounter[];
  virtualOperationLength: number | undefined;
  nonVirtualOperationLength: number | undefined;
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

  const OperationBadge = ({ operationTypeName, counter }: { operationTypeName: string; counter: number }) => (
    <div className="flex items-center space-x-1 rounded-full bg-buttonBg px-3 py-1">
      <span
        className={`inline-block w-2 h-2 ${getOperationColor(operationTypeName)}`}
        style={{ borderRadius: '2px' }}
      ></span>
      <span className="text-xs font-medium">{`${getOperationTypeForDisplay(operationTypeName)}: ${counter}`}</span>
    </div>
  );

  return (
    <section className="w-full flex flex-col items-start py-2">
      <div className="w-full">
        {/* Non-Virtual Operations */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold mb-1">Operations: {nonVirtualOperationLength}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {nonVirtualOperationsTypesCounters &&
              nonVirtualOperationsTypesCounters.map(({ operationTypeName, counter }) => (
                <OperationBadge key={operationTypeName} operationTypeName={operationTypeName} counter={counter} />
              ))}
          </div>
        </div>

        {/* Virtual Operations */}
        <div className="mb-2">
          <div className="flex items-center space-x-2 mb-1"> {/* Added space-x-2 */}
            <h3 className="text-sm font-semibold mb-1">Virtual Operations: {virtualOperationLength}</h3>
            {isRawView && (
              <div >
                <Toggle
                  checked={enableRawVirtualOperations}
                  onClick={handleEnableVirtualOperations}
                  className="h-2"
                />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {virtualOperationsTypesCounters &&
              virtualOperationsTypesCounters.map(({ operationTypeName, counter }) => (
                <OperationBadge key={operationTypeName} operationTypeName={operationTypeName} counter={counter} />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlockPageOperationCount;