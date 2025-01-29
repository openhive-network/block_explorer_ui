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
  handleFirstPage?:()=>void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalCount,
  siblingCount = 1,
  pageSize,
  onPageChange,
  isMirrored = false,
  className,
  handleLatestPage,
  handleFirstPage
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
    if (handleFirstPage) {
      handleFirstPage(); // Use the custom handler if provided
    } else {
      onPageChange(1); // Default behavior: go to first page
    }
  }

  const maxPage = Math.max(
    Number(paginationRange[0]),
    Number(paginationRange.at(-1))
  );

  const lastPage = Math.ceil(totalCount / pageSize);

  // Don't render pagination if there's only one page
  if (lastPage <= 1) {
    return null;
  }

  const onLastPage = () => {
    if (handleLatestPage) {
      handleLatestPage(); // Use the custom handler if provided
    } else {
      onPageChange(lastPage); // Default behavior: go to the last page
    }
  };

  const arrowStyle =
    "cursor-pointer border transition-colors duration-200 hover:border-explorer-dark-gray dark:border-explorer-bg-start dark:hover:border-white";

  const activePageStyle = "font-bold border border-black dark:border-white";

  const totalPages = Math.ceil(totalCount / pageSize);

  let iconPaddingClass = "";
  let pageItemPaddingClass = "";


  if (totalPages > 10 && totalPages < 100) {
    iconPaddingClass = "p-1.5 md:p-2.5 m-0";
    pageItemPaddingClass = "px-1.5 md:px-2.5";
  }
  else if (totalPages > 100 && totalPages < 1000) {
    iconPaddingClass = "p-0.5 md:p-2.5 m-0";
    pageItemPaddingClass = "px-1 md:px-2";
  } else if (totalPages >= 1000) {
    iconPaddingClass = "p-0.5 md:p-1 m-0";
    pageItemPaddingClass = "px-[0.5px] md:px-1.5";
  }else {
    iconPaddingClass = "p-2";
    pageItemPaddingClass = "px-3";
  }

  return (
    <Pagination
      className={cn("bg-theme p-2 flex items-center justify-center", className)}
    >
      <PaginationContent className="md:gap-x-1">
        {paginationRange.length > 1 &&
          (isMirrored ? currentPage !== maxPage : currentPage !== 1) && (
            <>
              <PaginationItem
                onClick={isMirrored ? onLastPage : onFirstPage}
                className={cn(arrowStyle, "flex items-center justify-center")}
              >
                <PaginationLatest className={iconPaddingClass} />
              </PaginationItem>

              <PaginationItem
                onClick={isMirrored ? onNext : onPrevious}
                className={cn(arrowStyle, "flex items-center justify-center")}
              >
                <PaginationPrevious className={iconPaddingClass} />
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
                  pageItemPaddingClass,
                  "py-1.5 cursor-pointer hover:bg-explorer-extra-light-gray text-[6px]",
                  {
                    [activePageStyle]: currentPage === pageNumber,
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
                className={cn(arrowStyle, "flex items-center justify-center")}
              >
                <PaginationNext className={iconPaddingClass} />
              </PaginationItem>
              <PaginationItem
                onClick={isMirrored ? onFirstPage : onLastPage}
                className={cn(arrowStyle, "flex items-center justify-center")}
              >
                <PaginationFirst className={iconPaddingClass} />
              </PaginationItem>
            </>
          )}
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;