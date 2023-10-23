import { Dispatch, SetStateAction } from "react";
import { usePagination, DOTS } from "./customHooks/usePagination";

interface PaginationProps {
  onPageChange: (value: any) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
}

const CustomPagination: React.FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
}) => {
  const paginationRange: any = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (!paginationRange || !paginationRange.length) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };
  const lastPage = paginationRange[paginationRange.length - 1];
  const firstPage = paginationRange[0];

  return (
    <ul className="flex list-none">
      <li
        className={`p-[12px] h-[32px] text-center m-2 text-explorer-dark-gray flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] cursor-pointer ${
          currentPage === firstPage && "hidden"
        }`}
        onClick={onPrevious}
      >
        <div className="relative w-[0.4em] h-[0.4em] border-t-[2px] border-r-[2px] border-explorer-dark-gray -rotate-[135deg]" />
      </li>
      {paginationRange.map((pageNumber: number | string, i: number) => {
        if (pageNumber === DOTS) {
          return (
            <li
              key={i}
              className="hover:bg-transparent p-[12px] h-[32px] text-center m-2 text-bg-explorer-dark-gray flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] "
            >
              &#8230;
            </li>
          );
        }

        return (
          <li
            key={i}
            className={`p-[12px] h-[32px] text-center m-2 text-white flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] hover:bg-explorer-dark-gray cursor-pointer ${
              pageNumber === currentPage && `bg-explorer-dark-gray`
            } `}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}
      <li
        className={`p-[12px] h-[32px] text-center m-2 text-explorer-dark-gray flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] cursor-pointer   ${
          currentPage === lastPage && "hidden"
        }`}
        onClick={onNext}
      >
        <div className="relative w-[0.4em] h-[0.4em] border-t-[2px] border-r-[2px] border-explorer-dark-gray rotate-45" />
      </li>
    </ul>
  );
};

export default CustomPagination;
