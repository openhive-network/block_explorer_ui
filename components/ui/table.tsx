import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Minimize2, Maximize2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

function getDisplayName(Tag: React.ElementType) {
  return typeof Tag === "string"
    ? Tag
    : (Tag as any).displayName || (Tag as any).name || "Component";
}

/**
 * HOC that:
 *  • Adds `stickyLeft?: boolean|number`
 *  • Always applies `baseClasses` (global defaults)
 *  • Then applies `px-4 align-middle`
 *  • Then applies any `className` the consumer passes
 *  • Is now RTL-aware
 *  • Applies `right` instead of `left` for sticky positioning in RTL
 *  • Applies `text-right` instead of `text-left` for alignment in RTL
 */
export function withSticky<T extends React.ElementType>(
  Tag: T,
  baseClasses = ""
) {
  type OwnProps = React.ComponentPropsWithoutRef<T>;
  type Props = OwnProps & { stickyLeft?: boolean | number; className?: string };
  type RefType = React.ComponentRef<T>;

  const StickyComp = React.forwardRef<RefType, Props>(
    ({ stickyLeft, style, className, ...props }, ref) => {
      const { dir } = useI18n();
      const isRTL = dir === "rtl";

      const stickyStyle =
        stickyLeft !== undefined
          ? {
              position: "sticky",
              [isRTL ? "right" : "left"]: stickyLeft === true ? 0 : stickyLeft,
              zIndex: 1,
              background: "inherit",
            }
          : undefined;

      return (
        <Tag
          ref={ref as any}
          style={{ ...(style as React.CSSProperties), ...stickyStyle }}
          className={cn(
            baseClasses,
            isRTL ? "text-right" : "text-left",
            className
          )}
          {...(props as any)}
        />
      );
    }
  );

  StickyComp.displayName = `withSticky(${getDisplayName(Tag)})`;
  return StickyComp as React.ForwardRefExoticComponent<
    Props & React.RefAttributes<RefType>
  >;
}

const rowVariants = {
  body: "transition-colors hover:bg-rowHover dark:hover:bg-rowHover data-[state=selected]:bg-muted",
  header: "font-medium bg-theme",
};

interface TableContextProps {
  showLeftArrow: boolean;
  showRightArrow: boolean;
}

const TableContext = React.createContext<TableContextProps>({
  showLeftArrow: false,
  showRightArrow: false,
});

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  enableMobileScrollArrows?: boolean;
  isStandaloneTable?: boolean;
  isDialog?: boolean;
  enableCompactToggle?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      children,
      enableMobileScrollArrows = false,
      isStandaloneTable = false,
      isDialog = false,
      enableCompactToggle = false,
      ...props
    },
    ref
  ) => {
    const { t } = useI18n();
    const [isCompact, setIsCompact] = React.useState(false);

    const handleToggleCompact = () => {
      setIsCompact(prev => !prev);
    };

    const [showLeftArrow, setShowLeftArrow] = React.useState(false);
    const [showRightArrow, setShowRightArrow] = React.useState(false);
    const tableRef = React.useRef<HTMLDivElement>(null);
    const [isTableVisible, setIsTableVisible] = React.useState(false);

    const { dir } = useI18n();
    const isRTL = dir === "rtl";

    const handleScroll = React.useCallback(() => {
      if (!tableRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;

      const atLeftEdge = scrollLeft <= 0;
      const atRightEdge = scrollLeft + clientWidth >= scrollWidth - 1;

      const shouldShowLeft = scrollLeft > 0 && !atLeftEdge && isTableVisible;
      const shouldShowRight =
        scrollLeft + clientWidth < scrollWidth &&
        !atRightEdge &&
        isTableVisible;

      setShowLeftArrow(shouldShowLeft);
      setShowRightArrow(shouldShowRight);

      // Always show arrows on mobile if it overflows
      if (
        window.innerWidth <= 768 &&
        scrollWidth > clientWidth &&
        isTableVisible &&
        enableMobileScrollArrows
      ) {
        setShowLeftArrow(shouldShowLeft);
        setShowRightArrow(shouldShowRight);
      }
    }, [isTableVisible, enableMobileScrollArrows]);

    React.useEffect(() => {
      if (!tableRef.current) return;
      const tableDiv = tableRef.current;

      const thresholdValue = isStandaloneTable ? 0.01 : 0.1;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const isSufficientlyVisible =
              entry.intersectionRatio >= thresholdValue;
            setIsTableVisible(entry.isIntersecting && isSufficientlyVisible);
          });
        },
        {
          root: null,
          threshold: thresholdValue,
        }
      );

      observer.observe(tableDiv);
      handleScroll();

      tableDiv.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);

      return () => {
        observer.unobserve(tableDiv);
        tableDiv.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }, [handleScroll, isStandaloneTable]);

    const arrowCommonStyle =
      "bg-gray-200 bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 z-20 cursor-pointer text-gray-700";

    const arrowConditionalStyle = isDialog
      ? "absolute"
      : "fixed top-1/2 transform -translate-y-1/2";

    const PrevArrowIcon = isRTL ? ChevronRight : ChevronLeft;
    const NextArrowIcon = isRTL ? ChevronLeft : ChevronRight;
    const prevArrowPosition = isRTL ? "right-2" : "left-2";
    const nextArrowPosition = isRTL ? "left-2" : "right-2";

    return (
      <TableContext.Provider value={{ showLeftArrow, showRightArrow }}>
        <div className={cn("transition-all duration-300 ease-in-out", isCompact ? "w-4/5 mx-auto" : "w-full")}>
          <div className="relative">
            {enableCompactToggle && (
              <div className="absolute -top-10 right-0 z-10 mt-10">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleToggleCompact}
                        className="p-1.5 rounded-md hover:bg-muted"
                      >
                        {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isCompact ? t("table.switchToFullView") : t("table.switchToCompactView")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            <div className="w-full overflow-auto" ref={tableRef}>
              <table
                ref={ref}
                className={cn(
                  "w-full caption-bottom bg-theme text-xs rounded max-w-full",
                  className
                )}
                {...props}
              >
                {children}
              </table>
            </div>

           {enableMobileScrollArrows && showLeftArrow && (
              <div
                className={cn(arrowCommonStyle, arrowConditionalStyle, prevArrowPosition)}
                style={isDialog ? { top: '10vh' } :  { top: '45vh' }}
                onClick={() => {
                tableRef.current?.scrollBy({
                  left: isRTL ? 100 : -100,
                  behavior: "smooth",
                });
                }}
              >
                <PrevArrowIcon size={20} />
              </div>
            )}

            {enableMobileScrollArrows && showRightArrow && (
              <div
                className={cn(arrowCommonStyle, arrowConditionalStyle, nextArrowPosition)}
                style={isDialog ? { top: '10vh' } :  { top: '45vh' }}
                onClick={() => {
                tableRef.current?.scrollBy({ 
                  left: isRTL ? -100 : 100,
                  behavior: "smooth" 
                });
                }}
              >
                <NextArrowIcon size={20} />
              </div>
            )}
          </div>
        </div>
      </TableContext.Provider>
    );
  }
);

Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("text-sm", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0 bg-theme dark:bg-theme max-w-[100%]",
      className
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-primary font-medium text-primary-foreground", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { rowVariant?: "body" | "header" }
>(({ className, rowVariant = "body", ...props }, ref) => {
  const { dir } = useI18n();
  const isRTL = dir === "rtl";
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b-2 bg-theme dark:border-gray-700",
        rowVariants[rowVariant],
        className
      )}
      {...props}
    />
  );
});
TableRow.displayName = "TableRow";

const TableHead = withSticky(
  "th",
  "h-12 px-4 align-middle font-medium bg-theme text-text [&:has([role=checkbox])]:pr-0"
);
TableHead.displayName = "TableHead";

const TableCell = withSticky(
  "td",
  "px-4 align-middle text-text [&:has([role=checkbox])]:pr-0"
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};