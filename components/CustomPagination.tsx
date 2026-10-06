import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePagination } from "../hooks/common/usePagination";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Pagination, PaginationContent, PaginationItem } from "./ui/pagination";
import { useI18n } from "../i18n/i18n";

interface CustomPaginationProps {
  currentPage: number;
  totalCount: number;
  siblingCount?: number;
  pageSize: number;
  onPageChange: (value: number) => void;
  isMirrored?: boolean;
  className?: string;
  handleLatestPage?: () => void;
  handleFirstPage?: () => void;
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
  handleFirstPage,
}) => {
  const { t, locale } = useI18n();
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!wrapper) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [wrapper]);

  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setIsPhone(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // On phones, show as many page numbers as fit on one line. Sizes follow the
  // phone button classes: 28px wide (min-w-7), 12px padding (px-1.5), 4px gap
  // (gap-1) and about 7px per digit at text-xs; 16px is the bar's own padding.
  let fittedSiblingCount = siblingCount;
  if (isPhone && width > 0) {
    const pageCount = Math.ceil(totalCount / pageSize);
    const arrowsWidth = 4 * (28 + 4);
    // Sized by the widest number the window around the current page can show.
    const fits = (siblings: number) => {
      const numbers = 2 * siblings + 3;
      const widest = Math.min(
        pageCount,
        Math.max(currentPage + siblings + 1, numbers)
      );
      const numberWidth = Math.max(28, String(widest).length * 7 + 12) + 4;
      return numbers * numberWidth <= width - 16 - arrowsWidth;
    };
    fittedSiblingCount = fits(2) ? 2 : fits(1) ? 1 : 0;
  }

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount: fittedSiblingCount,
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
  };

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

  const buttonStyle =
    "inline-flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs tabular-nums text-text transition-colors hover:bg-rowHover disabled:pointer-events-none disabled:opacity-40 sm:h-8 sm:min-w-8 sm:text-[13px]";
  const arrowStyle = cn(buttonStyle, "border border-navbar-border px-0");
  const iconStyle = "h-3.5 w-3.5 rtl:rotate-180";

  const hasPages = paginationRange.length > 1;
  const atStart =
    !hasPages || (isMirrored ? currentPage === maxPage : currentPage === 1);
  const atEnd =
    !hasPages || (isMirrored ? currentPage === 1 : currentPage === maxPage);

  return (
    <div ref={setWrapper} className="w-full">
      <Pagination
        aria-label={t("pagination.label")}
        className={cn(
          "bg-theme p-1.5 flex items-center justify-center",
          className
        )}
      >
        <PaginationContent className="justify-center gap-1">
          <PaginationItem>
            <button
              type="button"
              aria-label={t(
                isMirrored ? "pagination.last" : "pagination.first"
              )}
              disabled={atStart}
              onClick={isMirrored ? onLastPage : onFirstPage}
              className={arrowStyle}
            >
              <ChevronsLeft className={iconStyle} />
            </button>
          </PaginationItem>
          <PaginationItem>
            <button
              type="button"
              aria-label={t(
                isMirrored ? "pagination.next" : "pagination.previous"
              )}
              disabled={atStart}
              onClick={isMirrored ? onNext : onPrevious}
              className={arrowStyle}
            >
              <ChevronLeft className={iconStyle} />
            </button>
          </PaginationItem>
          {paginationRange.map((pageNumber: number | string) => {
            const isActive = currentPage === pageNumber;
            return (
              <PaginationItem key={pageNumber}>
                <button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onPageChange(Number(pageNumber))}
                  className={cn(
                    buttonStyle,
                    isActive &&
                      "bg-indigo-500 font-semibold text-white hover:bg-indigo-500"
                  )}
                >
                  {Number(pageNumber).toLocaleString(locale, {
                    useGrouping: false,
                  })}
                </button>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <button
              type="button"
              aria-label={t(
                isMirrored ? "pagination.previous" : "pagination.next"
              )}
              disabled={atEnd}
              onClick={isMirrored ? onPrevious : onNext}
              className={arrowStyle}
            >
              <ChevronRight className={iconStyle} />
            </button>
          </PaginationItem>
          <PaginationItem>
            <button
              type="button"
              aria-label={t(
                isMirrored ? "pagination.first" : "pagination.last"
              )}
              disabled={atEnd}
              onClick={isMirrored ? onFirstPage : onLastPage}
              className={arrowStyle}
            >
              <ChevronsRight className={iconStyle} />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CustomPagination;
