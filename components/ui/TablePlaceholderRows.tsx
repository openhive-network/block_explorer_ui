import { TableCell, TableRow } from "./table";

// Grey bars in place of rows while a table loads its first results, so the
// header, toolbar and pagination stay where they are instead of a spinner.
const BAR_WIDTHS = ["w-10/12", "w-7/12", "w-9/12", "w-5/12", "w-8/12"];

interface TablePlaceholderRowsProps {
  columns: number;
  rows?: number;
}

const TablePlaceholderRows: React.FC<TablePlaceholderRowsProps> = ({
  columns,
  rows = 10,
}) => (
  <>
    {Array.from({ length: rows }, (_, row) => (
      <TableRow
        key={`placeholder-${row}`}
        data-testid="table-placeholder-row"
        aria-hidden
      >
        {Array.from({ length: columns }, (_, column) => (
          <TableCell key={column}>
            <div
              className={`h-4 animate-pulse rounded bg-slate-100 motion-reduce:animate-none dark:bg-slate-800 ${
                BAR_WIDTHS[(row + column) % BAR_WIDTHS.length]
              }`}
            />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

export default TablePlaceholderRows;
