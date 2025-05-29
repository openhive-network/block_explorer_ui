import * as React from "react";
import { cn } from "@/lib/utils";

function getDisplayName(Tag: React.ElementType) {
  return typeof Tag === "string"
    ? Tag
    : (Tag as any).displayName || (Tag as any).name || "Component";
}

/**
 * HOC that:
 *  • Adds `stickyLeft?: boolean|number`
 *  • Always applies `baseClasses` (global defaults)
 *  • Then applies `"px-4 align-middle"`
 *  • Then applies any `className` the consumer passes
 */
export function withSticky<T extends React.ElementType>(
  Tag: T,
  baseClasses = ""
) {
  type OwnProps = React.ComponentPropsWithoutRef<T>;
  type Props = OwnProps & { stickyLeft?: boolean | number; className?: string };
  type RefType = React.ElementRef<T>;

  const StickyComp = React.forwardRef<RefType, Props>(
    ({ stickyLeft, style, className, ...props }, ref) => {
      const stickyStyle =
        stickyLeft !== undefined
          ? {
              position: "sticky",
              left: stickyLeft === true ? 0 : stickyLeft,
              zIndex: 1,
              background: "inherit",
            }
          : undefined;

      return (
        <Tag
          ref={ref as any}
          style={{ ...(style as React.CSSProperties), ...stickyStyle }}
          className={cn(baseClasses, className)}
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

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom bg-theme text-xs rounded max-w-full",
        className
      )}
      {...props}
    />
  </div>
));
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
>(({ className, rowVariant = "body", ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b-2 text-left bg-theme dark:border-gray-700",
      rowVariants[rowVariant],
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = withSticky(
  "th",
  "h-12 px-4 text-left align-middle font-medium bg-theme text-text [&:has([role=checkbox])]:pr-0"
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
