import * as React from "react";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  mobileScrollIcons?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, mobileScrollIcons = false, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(true);  

    React.useEffect(() => {
      if (!mobileScrollIcons) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { threshold: 0 } 
      );

      const container = containerRef.current;
      if (container) {
        observer.observe(container);
      }

      return () => {
        if (container) {
          observer.unobserve(container);
        }
      };
    }, [mobileScrollIcons]);

    React.useEffect(() => {
      if (!mobileScrollIcons) return;

      const updateScrollState = () => {
        if (containerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
          setCanScrollLeft(scrollLeft > 0);
          setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
        }
      };

      updateScrollState();
      const container = containerRef.current;

      container?.addEventListener("scroll", updateScrollState);
      window.addEventListener("resize", updateScrollState);

      return () => {
        container?.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      };
    }, [mobileScrollIcons]);

    const scroll = (direction: "left" | "right") => {
      if (containerRef.current) {
        const scrollAmount = direction === "left" ? -200 : 200;
        containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    };

    return (
      <div className={cn("relative w-full overflow-y-auto", className)}>

        {mobileScrollIcons && canScrollLeft && isVisible && (
          <div
            className="scroll-icon-left"
            onClick={() => scroll("left")}
          >
            <FontAwesomeIcon icon={faArrowLeft}/>
          </div>
        )}

        {mobileScrollIcons && canScrollRight && isVisible && (
          <div
            className="scroll-icon-right"
            onClick={() => scroll("right")}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </div>
        )}

        <div
          ref={containerRef}
          className={cn(
            "relative w-full overflow-x-auto", 
            "max-w-full"
          )}
        >
          {/* Table */}
          <table
            ref={ref}
            className={cn(
              "w-full table-auto border-collapse",
              "text-sm",
              className
            )}
            {...props}
          />
        </div>
      </div>
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
    className={cn(className)}
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
      "[&_tr:last-child]:border-0 bg-theme dark:bg-theme",
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
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-rowHover dark:hover:bg-rowHover data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium bg-theme text-text [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
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