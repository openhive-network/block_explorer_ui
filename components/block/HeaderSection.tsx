interface Props {
  blockNumber: number;
  nextBlock: () => void;
  prevBlock: () => void;
  timeStamp: string;
  virtualOperationLength: number;
  nonVirtualOperationLength: number;
}

const HeaderSection = (props: Props) => {
  const {
    blockNumber,
    nextBlock,
    prevBlock,
    timeStamp,
    virtualOperationLength,
    nonVirtualOperationLength,
  } = props;

  return (
    <section className="flex items-center justify-center">
      <div className=" w-4/6 text-center bg-gray-600 text-white ">
        <p>Block Number : {blockNumber}</p>
        <div className="items-center m-3">
          <button
            onClick={prevBlock}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Previous Block
          </button>
          <button
            onClick={nextBlock}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Next block
          </button>
        </div>
        <div className="items-center m-3">
          <p>Transactions: {virtualOperationLength} </p>
          <p>Virtual Operations: {nonVirtualOperationLength} </p>
          <p>Block Time : {timeStamp}</p>
        </div>
      </div>
    </section>
  );
};

export default HeaderSection;
