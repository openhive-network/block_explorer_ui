import Hive from "@/types/Hive";
import OperationTypesDialog from "./OperationTypesDialog";

type FiltersSectionProps = {
  operationTypes: Hive.OperationTypes[];
};

const FiltersSection: React.FC<FiltersSectionProps> = ({ operationTypes }) => {
  return (
    <section className="flex justify-center mt-4 ">
      <OperationTypesDialog operationTypes={operationTypes} />
    </section>
  );
};

export default FiltersSection;
