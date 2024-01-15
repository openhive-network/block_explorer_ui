import { cn } from "@/lib/utils";
import { usePagination, DOTS } from "./customHooks/usePagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  onPageChange: (value: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
  shouldScrollToTop?: boolean;
  isMirrored?: boolean;
}

const scrollToTop = () => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
};

const CustomPagination: React.FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className,
  shouldScrollToTop = true,
  isMirrored = false
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
    if (shouldScrollToTop) scrollToTop();
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
    if (shouldScrollToTop) scrollToTop();
  };

  const handlePageChange = (page: number | string) => {
    onPageChange(Number(page));
    if (shouldScrollToTop) scrollToTop();
  };
  const lastPage = paginationRange[paginationRange.length - 1];
  const firstPage = paginationRange[0];

  const getChevrons = (isFirst: boolean) => {
    if (isFirst) return isMirrored ? <ChevronRight /> : <ChevronLeft />;
    if (!isFirst) return isMirrored ? <ChevronLeft /> : <ChevronRight />;
  }

  return (
    <ul className={cn("flex list-none ", className, {"flex-row-reverse": isMirrored})}>
      <li
        className={`p-3 h-8 text-center mx-0 mt-2 md:m-2 text-explorer-dark-gray flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] cursor-pointer ${
          currentPage === firstPage && "hidden"
        }`}
        onClick={onPrevious}
      >
        {getChevrons(true)}
      </li>
      {paginationRange.map((pageNumber: number | string, i: number) => {
        if (pageNumber === DOTS) {
          return (
            <li
              key={i}
              className="hover:bg-transparent p-0 md:p-3 h-8 text-center m-2 text-bg-explorer-dark-gray flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] "
            >
              &#8230;
            </li>
          );
        }

        return (
          <li
            key={i}
            className={`p-2 md:p-3 h-8 text-center m-2 flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] hover:bg-white cursor-pointer ${
              pageNumber === currentPage &&
              `text-inherit text-explorer-dark-gray font-extrabold bg-white hover:bg-white cursor-auto`
            } `}
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}
      <li
        className={`p-3 h-8 text-center mx-0 mt-2 md:m-2 text-explorer-dark-gray flex box-border items-center tracking-widest rounded-2xl leading-6 text-sm w-min-[32px] cursor-pointer   ${
          currentPage === lastPage && "hidden"
        }`}
        onClick={onNext}
      >
        {getChevrons(false)}
      </li>
    </ul>
  );
};

export default CustomPagination;
