import Explorer from "@/types/Explorer";

type Props = {
  nonVirtualOperations: Explorer.Block[];
};

const NonVirtualOperations = (props: Props) => {
  const { nonVirtualOperations } = props;

  return (
    <div className="w-auto">
      <div className="text-center">
        <p className="text-lg text-white">Operations</p>
      </div>
      {nonVirtualOperations.length ? (
        nonVirtualOperations.map((operation) => (
          <div key={operation.operation_id} className="p-10 m-10 bg-gray-500">
            <pre>{JSON.stringify(operation, null, 3)}</pre>
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
