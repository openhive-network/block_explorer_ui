import { useQuery, UseQueryResult } from "@tanstack/react-query";
import OperationTypesModal from "./OperationTypesModal";
import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";

interface Props {
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

const FiltersSection = (props: Props) => {
  const { openModal, closeModal, isModalOpen } = props;

  const { data: operationTypes }: UseQueryResult<Explorer.OperationTypes[]> =
    useQuery({
      queryKey: ["operation_types"],
      queryFn: () => fetchingService.getOperationTypes(""),
    });

  if (!operationTypes) return null;

  return (
    <section className="flex justify-center mt-4 ">
      <button
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        onClick={openModal}
      >
        Filters
      </button>
      <OperationTypesModal
        isOpen={isModalOpen}
        close={closeModal}
        operationTypes={operationTypes}
      />
    </section>
  );
};

export default FiltersSection;
