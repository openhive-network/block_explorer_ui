import Link from "next/link";

import { useSearchesContext } from "@/contexts/SearchesContext";
import useBlockSearch from "@/hooks/api/homePage/useBlockSearch";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import ErrorPage from "@/pages/ErrorPage";
import { getBlockPageLink } from "../utils/blockSearchHelpers";

const BlockSearchResults = () => {
  const { blockSearchProps } = useSearchesContext();
  const { operationsTypes } = useOperationsTypes();

  const { blockSearchData, blockSearchDataError } =
    useBlockSearch(blockSearchProps);

  const blockPageLink = getBlockPageLink(blockSearchProps, operationsTypes);

  if (blockSearchDataError) {
    return <ErrorPage />;
  }

  if (!blockSearchData) return;

  return (
    <div className="bg-theme dark:bg-theme p-2 md: h-fit rounded">
      <div className="text-center">Results:</div>
      <div className="flex flex-wrap">
        {blockSearchData.total_blocks > 0 ? (
          blockSearchData.blocks_result.map(({ block_num }) => (
            <Link
              key={block_num}
              href={blockPageLink(block_num)}
            >
              <div className="m-1 border border-solid p-1">{block_num}</div>
            </Link>
          ))
        ) : (
          <div className="flex justify-center w-full">
            No blocks matching given criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockSearchResults;
