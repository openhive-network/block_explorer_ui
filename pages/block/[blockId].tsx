import { useState } from "react";
import fetchingService from "@/services/FetchingService";
import Explorer from "@/types/Explorer";
import OperationTypesModal from "@/components/global/OperationTypesModal";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export default function Block() {
  // TODO : Remove initial values later

  const [initialBlockNumber, setInitialBlockNumber] = useState(12345);
  const [initialBlockFilters, setInitialBlockFilters] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    isLoading: isBlockOperationsLoading,
    data: blockOperations,
  }: UseQueryResult<Explorer.Block[]> = useQuery({
    queryKey: ["block_operations", initialBlockNumber, initialBlockFilters],
    queryFn: () =>
      fetchingService.getOpsByBlock(initialBlockNumber, initialBlockFilters),
  });

  const { data: operationTypes }: UseQueryResult<Explorer.OperationTypes[]> =
    useQuery({
      queryKey: ["operation_types"],
      queryFn: () => fetchingService.getOperationTypes(""),
    });

  if (!blockOperations || !blockOperations.length || !operationTypes?.length) {
    return null;
  }

  const virtualOperations = blockOperations.filter(
    (operation) => operation.virtual_op
  );

  const nonVirtualOperation = blockOperations.filter(
    (operation) => !operation.virtual_op
  );

  const handleNextBlockNumber = () =>
    setInitialBlockNumber((prev) => (prev += 1));

  const handePreviousBlockNumber = () =>
    setInitialBlockNumber((prev) => (prev -= 1));

  const blockTimeStamp = blockOperations[0].timestamp;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {isBlockOperationsLoading ? (
        <div>Loading .....</div>
      ) : (
        <div className="p-10">
          <section className="flex-column items-center justify-center bg-gray-600 text-white ">
            <p>Block Number : {initialBlockNumber}</p>
            <div className="items-center m-3">
              <button
                onClick={handePreviousBlockNumber}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Previous Block
              </button>
              <button
                onClick={handleNextBlockNumber}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Next block
              </button>
            </div>
            <div className="items-center m-3">
              <p>Transactions: {virtualOperations.length} </p>
              <p>Virtual Operations: {nonVirtualOperation.length} </p>
              <p>Block Time : {blockTimeStamp}</p>
            </div>
          </section>
          <section className="flex justify-center mt-4 ">
            <button
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={handleOpenModal}
            >
              Filters
            </button>
            <OperationTypesModal
              isOpen={isModalOpen}
              close={handleCloseModal}
              operationTypes={operationTypes}
            />
          </section>
          <section className="flex-column items-center justify-center p-10">
            <div>
              {blockOperations.map((operation: any) => (
                <div
                  key={operation.operation_id}
                  className="p-10 m-10 bg-gray-500 w-auto"
                >
                  <pre>{JSON.stringify(operation, null, 3)}</pre>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
