import Hive from "@/types/Hive";
import OperationTypesDialog from "./OperationTypesDialog";

type FiltersSectionProps = {
  operationTypes: Hive.OperationTypes[];
  setFilters: (filters: string[]) => void;
};

const FiltersSection: React.FC<FiltersSectionProps> = ({
  operationTypes,
  setFilters,
}) => {
  return (
    <section className="flex justify-center mt-4 ">
      <OperationTypesDialog
        operationTypes={operationTypes}
        setFilters={setFilters}
      />
    </section>
  );
};

export default FiltersSection;
