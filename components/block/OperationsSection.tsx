import NonVirtualOperations from "./NonVirtualOperations";
import VirtualOperations from "./VirtualOperations";
import Explorer from "@/types/Explorer";

interface Props {
  nonVirtualOperations: Explorer.Block[];
  virtualOperations: Explorer.Block[];
}

const OperationsSection = (props: Props) => {
  const { nonVirtualOperations, virtualOperations } = props;
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
