import Hive from "@/types/Hive";
import OperationCard from "../OperationCard";

type VirtualOperationsProps = {
  virtualOperations: Hive.OpsByBlockResponse[];
};

const VirtualOperations: React.FC<VirtualOperationsProps> = ({
  virtualOperations,
}) => {
  return (
    <div className="mt-10">
      <div className="text-center">
        <p className="text-3xl text-white">Virtual Operations</p>
      </div>
      {virtualOperations.length ? (
        virtualOperations.map((operation) => (
          <div key={operation.operation_id}>
            <OperationCard
              operation={operation.operation}
              date={new Date(operation.timestamp)}
              blockNumber={operation.block}
              transactionId={operation.trx_id}
              isVirtual={operation.virtual_op}
            />
          </div>
        ))
      ) : (
        <div className="text-center m-10">
          <p className="text-sm text-red-400">No Virtual Operations</p>
        </div>
      )}
    </div>
  );
};

export default VirtualOperations;
