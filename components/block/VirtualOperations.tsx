import Explorer from "@/types/Explorer";
import OperationCard from "../OperationCard";

type Props = {
  virtualOperations: Explorer.Block[];
};

const VirtualOperations = (props: Props) => {
  const { virtualOperations } = props;

  return (
    <div className="mt-10">
      <div className="text-center">
        <p className="text-lg text-white">Virtual Operations</p>
      </div>
      {virtualOperations.length ? (
        virtualOperations.map((operation) => (
          <div key={operation.operation_id}>
            <OperationCard
              operation={operation.operations}
              age={operation.age}
              blockNumber={operation.block}
              transactionId={operation.trx_id}
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
