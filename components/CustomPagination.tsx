import { cn } from "@/lib/utils";
import { DOTS, usePagination } from "./customHooks/usePagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalCount: number;
  siblingCount?: number;
  pageSize: number;
  onPageChange: (value: number) => void;
  isMirrored?: boolean;
  className?: string;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalCount,
  siblingCount = 1,
  pageSize,
  onPageChange,
  isMirrored = true,
  className,
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
    isMirrored,
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

  const maxPage = Math.max(
    Number(paginationRange[0]),
    Number(paginationRange.at(-1))
  );

  return (
    <Pagination className={className}>
      <PaginationContent className="md:gap-x-4">
        {paginationRange.length > 1 &&
          (isMirrored ? currentPage !== maxPage : currentPage !== 1) && (
            <PaginationItem
              onClick={isMirrored ? onNext : onPrevious}
              className="cursor-pointer"
            >
              <PaginationPrevious />
            </PaginationItem>
          )}
        {paginationRange.map((pageNumber: number | string, i: number) => {
          if (pageNumber === DOTS) {
            return (
              <PaginationItem key={i}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          } else {
            return (
              <PaginationItem
                key={i}
                className={cn(
                  "px-1 md:px-3 md:py-1.5 rounded-full cursor-pointer hover:bg-white dark:hover:bg-explorer-dark-gray",
                  {
                    "bg-white font-bold dark:bg-explorer-dark-gray": currentPage === pageNumber,
                  }
                )}
                onClick={() => onPageChange(Number(pageNumber))}
              >
                <PaginationLink
                  className={cn("h-fit", {
                    "font-bold": currentPage === pageNumber,
                  })}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          }
        })}
        {paginationRange.length > 1 &&
          (isMirrored ? currentPage !== 1 : currentPage !== maxPage) && (
            <PaginationItem
              onClick={isMirrored ? onPrevious : onNext}
              className="cursor-pointer"
            >
              <PaginationNext />
            </PaginationItem>
          )}
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;
