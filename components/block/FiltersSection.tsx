import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";
import OperationTypesDialog from "./OperationTypesDialog";

const FiltersSection = () => {
  const { data: operationTypes }: UseQueryResult<Hive.OperationTypes[]> =
    useQuery({
      queryKey: ["operation_types"],
      queryFn: () => fetchingService.getOperationTypes(""),
    });

  if (!operationTypes) return null;

  return (
    <section className="flex justify-center mt-4 ">
      <OperationTypesDialog operationTypes={operationTypes} />
    </section>
  );
};

export default FiltersSection;
