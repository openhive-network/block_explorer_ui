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
}

const CustomPagination2: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalCount,
  siblingCount = 1,
  pageSize,
  onPageChange,
  isMirrored,
}) => {
  const paginationRange = usePagination({
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

  return (
    <Pagination>
      <PaginationContent className="md:gap-x-4">
        <PaginationItem
          onClick={isMirrored ? onNext : onPrevious}
          className="cursor-pointer"
        >
          <PaginationPrevious />
        </PaginationItem>
        {(isMirrored ? paginationRange.reverse() : paginationRange)?.map(
          (pageNumber: number | string, i: number) => {
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
                    "px-1 md:px-3 md:py-1.5 rounded-full cursor-pointer hover:bg-white",
                    {
                      "bg-white font-bold": currentPage === pageNumber,
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
          }
        )}
        <PaginationItem
          onClick={isMirrored ? onPrevious : onNext}
          className="cursor-pointer"
        >
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination2;
