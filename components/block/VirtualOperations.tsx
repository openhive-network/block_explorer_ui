import Explorer from "@/types/Explorer";

type Props = {
  virtualOperations: Explorer.Block[];
};

const VirtualOperations = (props: Props) => {
  const { virtualOperations } = props;

  return (
    <div className="w-auto">
      <div className="text-center">
        <p className="text-lg text-white">Virtual Operations</p>
      </div>
      {virtualOperations.length ? (
        virtualOperations.map((operation) => (
          <div
            key={operation.operation_id}
            className="p-10 m-10 bg-gray-500 w-auto"
          >
            <pre>{JSON.stringify(operation, null, 3)}</pre>
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
