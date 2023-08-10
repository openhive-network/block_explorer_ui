import { Dispatch, SetStateAction } from "react";
import { usePagination, DOTS } from "./customHooks/usePagination";

interface PaginationProps {
  onPageChange: (value: any) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  setAction: (value: number) => void;
}

const CustomPagination: React.FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  setAction,
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
    setAction(totalCount - pageSize);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
    setAction(totalCount + pageSize);
  };
  const lastPage = paginationRange[paginationRange.length - 1];
  const firstPage = paginationRange[0];

  return (
    <ul className="flex list-none">
      <li
        className={`p-[12px] h-[32px] text-center m-2 text-gray-700 flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] hover:bg-gray-500 cursor-pointer ${
          currentPage === firstPage && "pointer-events-none"
        }`}
        onClick={onPrevious}
      >
        <div className="relative w-[0.4em] h-[0.4em] border-t-[2px] border-r-[2px] border-gray-600 -rotate-[135deg]" />
      </li>
      {paginationRange.map((pageNumber: number | string, i: number) => {
        if (pageNumber === DOTS) {
          return (
            <li
              key={i}
              className="hover:bg-transparent cursor-pointer p-[12px] h-[32px] text-center m-2 text-gray-700 flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] "
            >
              &#8230;
            </li>
          );
        }

        return (
          <li
            key={i}
            className={`p-[12px] h-[32px] text-center m-2 text-gray-700 flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] hover:bg-gray-500 cursor-pointer ${
              pageNumber === currentPage && `bg-gray-500`
            } `}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}
      <li
        className={`p-[12px] h-[32px] text-center m-2 text-gray-700 flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] hover:bg-gray-500 cursor-pointer   ${
          currentPage === lastPage && "pointer-events-none"
        }`}
        onClick={onNext}
      >
        <div className="relative w-[0.4em] h-[0.4em] border-t-[2px] border-r-[2px] border-gray-600 rotate-45" />
      </li>
    </ul>
  );
};

export default CustomPagination;
