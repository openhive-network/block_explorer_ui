import { Dispatch, SetStateAction } from "react";
import Hive from "@/types/Hive";
import OperationTypesDialog from "./OperationTypesDialog";

type FiltersSectionProps = {
  operationTypes: Hive.OperationTypes[];
  setFilters: Dispatch<SetStateAction<number[]>>
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
