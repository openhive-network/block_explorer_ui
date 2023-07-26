import NonVirtualOperations from "./NonVirtualOperations";
import VirtualOperations from "./VirtualOperations";
import Hive from "@/types/Hive";

interface OperationsSectionProps {
  nonVirtualOperations: Hive.OpsByBlockResponse[];
  virtualOperations: Hive.OpsByBlockResponse[];
}

const OperationsSection: React.FC<OperationsSectionProps> = ({
  nonVirtualOperations,
  virtualOperations,
}) => {
  return (
    <section className="p-10 flex items-center justify-center">
      <div className="w-4/5">
        <NonVirtualOperations nonVirtualOperations={nonVirtualOperations} />
        <VirtualOperations virtualOperations={virtualOperations} />
      </div>
    </section>
  );
};

export default OperationsSection;
