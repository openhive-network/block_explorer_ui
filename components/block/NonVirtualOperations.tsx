import Explorer from "@/types/Explorer";
import OperationCard from "../OperationCard";

type Props = {
  nonVirtualOperations: Explorer.Block[];
};

const NonVirtualOperations = (props: Props) => {
  const { nonVirtualOperations } = props;

  return (
    <div className="flex-column justify-center align-center">
      <div className="text-center">
        <p className="text-3xl text-white">Operations</p>
      </div>
      {nonVirtualOperations.length ? (
        nonVirtualOperations.map((operation) => (
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
          <p className="text-sm text-red-400">No Operations</p>
        </div>
      )}
    </div>
  );
};

export default NonVirtualOperations;
