import { cn } from "@/lib/utils";
import { usePagination } from "../hooks/common/usePagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationLatest,
  PaginationFirst,
} from "./ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalCount: number;
  siblingCount?: number;
  pageSize: number;
  onPageChange: (value: number) => void;
  isMirrored?: boolean;
  className?: string;
  handleLatestPage?: () => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalCount,
  siblingCount = 1,
  pageSize,
  onPageChange,
  isMirrored = true,
  className,
  handleLatestPage,
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

  const onFirstPage = () => {
    onPageChange(1);
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
            <>
              <PaginationItem
                onClick={handleLatestPage}
                className="cursor-pointer"
              >
                <PaginationLatest />
              </PaginationItem>

              <PaginationItem
                onClick={isMirrored ? onNext : onPrevious}
                className="cursor-pointer"
              >
                <PaginationPrevious />
              </PaginationItem>
            </>
          )}
        {paginationRange.map(
          (pageNumber: number | string, i: number) => {
            // Comment out only DOTS if we need them in future

            // if (pageNumber === DOTS) {
            //   return (
            //     <PaginationItem key={i}>
            //       <PaginationEllipsis />
            //     </PaginationItem>
            //   );
            // } else {
            return (
              <PaginationItem
                key={i}
                className={cn(
                  "px-1 md:px-3 md:py-1.5 rounded-full cursor-pointer hover:bg-white dark:hover:bg-theme",
                  {
                    "font-bold bg-white dark:bg-theme":
                      currentPage === pageNumber,
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
          // }
        )}
        {paginationRange.length > 1 &&
          (isMirrored ? currentPage !== 1 : currentPage !== maxPage) && (
            <>
              <PaginationItem
                onClick={isMirrored ? onPrevious : onNext}
                className="cursor-pointer"
              >
                <PaginationNext />
              </PaginationItem>
              <PaginationItem
                onClick={onFirstPage}
                className="cursor-pointer"
              >
                <PaginationFirst />
              </PaginationItem>
            </>
          )}
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;
