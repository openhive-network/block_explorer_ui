import Hive from "@/types/Hive";


interface BlockPageOperationCountProps {
  operations?: Hive.OperationResponse[];
  virtualOperationLength: number;
  nonVirtualOperationLength: number;
}

const BlockPageOperationCount: React.FC<BlockPageOperationCountProps> = ({operations, virtualOperationLength, nonVirtualOperationLength}) => {

  const nonvirtualOperationCounts: Map<string, number> = new Map(); 
  const virtualOperationCounts: Map<string, number> = new Map(); 
  operations?.forEach((operation) => {
    const operationType = operation.operation.type;
    const isVirtual = operation.virtual_op;
    const mapToWrite = isVirtual ? virtualOperationCounts : nonvirtualOperationCounts;
    const exisitngOperationCount = mapToWrite.get(operationType);
    if (exisitngOperationCount) {
      mapToWrite.set(operationType, exisitngOperationCount + 1);
    } else {
      mapToWrite.set(operationType, 1);
    }
  })

  return (
    <section className="w-full flex flex-col items-center text-md px-4 mb-2 md:mb-4">
      <div className="w-full md:w-4/6 py-4">
        <div className="my-2">Operations: {nonVirtualOperationLength}</div>
        <div className="flex flex-wrap flex-col md:flex-row text-sm">
          {Array.from(nonvirtualOperationCounts).map(([operationName, counter]) => (
            <div key={operationName} className="flex justify-between p-2 md:w-1/2 border-b border-solid border-gray-700  border-r">
              <span className="mr-2">{`${operationName}: `}</span>
              <span>{counter}</span>
            </div>
          ))}
        </div>
        <div className="my-2">Virtual operations: {virtualOperationLength}</div>
        <div className="flex flex-wrap flex-col md:flex-row text-sm">
          {Array.from(virtualOperationCounts).map(([operationName, counter]) => (
            <div key={operationName} className="flex justify-between p-2 md:w-1/2 border-b border-solid border-gray-700  border-r">
              <span className="mr-2">{`${operationName}: `}</span>
              <span>{counter}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlockPageOperationCount;
