import { Fragment } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Hourglass,
  Repeat,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import { grabNumericValue } from "./StringUtils";
import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AllTransfers } from "@/components/account/AccountRecurrentTransfersCard";

type SortedTransfers = {
  transfers: AllTransfers[];
  key: string;
  isAscending: boolean;
};

type KeyMapFn = (t: AllTransfers) => string | number;

// The name column takes all spare width; the others shrink to their content.
const COLUMN_CLASSES = [
  "w-full text-start",
  "w-px text-end",
  "w-px text-center",
  "w-px text-center",
];

// Narrow columns show an icon in the header; the label moves to a tooltip.
const HEADER_ICONS: Partial<Record<string, typeof Repeat>> = {
  Recurrence: Repeat,
  Remaining: Hourglass,
};

export const TABLE_HEADER_CELLS_OUTGOING = [
  "Recipient",
  "Amount",
  "Recurrence",
  "Remaining",
];
export const TABLE_HEADER_CELLS_INCOMING = [
  "Sender",
  "Amount",
  "Recurrence",
  "Remaining",
];

export const handleSortTransfers = ({
  transfers,
  key,
  isAscending,
}: SortedTransfers) => {
  const keyMap: Record<
    "recipient" | "sender" | "amount" | "recurrence" | "remaining",
    KeyMapFn
  > = {
    recipient: (t) => ("to" in t ? t.to : ""),
    sender: (t) => ("from" in t ? t.from : ""),
    amount: (t) => grabNumericValue(t.amount),
    recurrence: (t) => t.recurrence,
    remaining: (t) => t.remaining_executions,
  };

  type TransferKey = keyof typeof keyMap;

  const accessor = keyMap[key as TransferKey];

  if (!accessor) return transfers;

  const symbolOf = (t: AllTransfers) => t.amount.split(" ").pop() ?? "";

  return [...transfers].sort((a, b) => {
    if (key === "amount") {
      const bySymbol = symbolOf(a).localeCompare(symbolOf(b));
      if (bySymbol !== 0) return bySymbol;
    }
    const aValue = accessor(a);
    const bValue = accessor(b);

    if (aValue < bValue) return isAscending ? -1 : 1;
    if (aValue > bValue) return isAscending ? 1 : -1;
    return 0;
  });
};

const renderChevron = (
  cellName: string,
  sortKey: string,
  isOrderAscending: boolean
) => {
  if (!cellName) return;

  const isKeyEqualToCell = sortKey === cellName.toLocaleLowerCase();

  if (isKeyEqualToCell && isOrderAscending) {
    return <ChevronUp size={13} className="ms-0.5" />;
  } else if (isKeyEqualToCell && !isOrderAscending) {
    return <ChevronDown size={13} className="ms-0.5" />;
  } else {
    return <ChevronsUpDown size={13} className="ms-0.5" />;
  }
};

export const buildTableHead = (
  handleSort: (key: string) => void,
  sortKey: string,
  isOrderAscending: boolean,
  direction: "incoming" | "outgoing",
  t: (key: string) => string
) => {
  const tableHeaderCells =
    direction === "incoming"
      ? TABLE_HEADER_CELLS_INCOMING
      : TABLE_HEADER_CELLS_OUTGOING;

  return tableHeaderCells.map((cellName: string, index: number) => {
    const label = t(`recurrentTransfersSort.${cellName}`);
    const Icon = HEADER_ICONS[cellName];
    const sortButton = (
      <Button
        className="bg-inherit hover:bg-inherit p-0 m-0 h-auto text-xs sm:text-sm"
        aria-label={label}
        onClick={() => handleSort(cellName.toLocaleLowerCase())}
      >
        {Icon ? <Icon className="h-4 w-4" aria-hidden /> : label}
        {renderChevron(cellName, sortKey, isOrderAscending)}
      </Button>
    );
    return (
      <Fragment key={cellName}>
        <TableHead
          key={cellName}
          className={cn(
            "whitespace-nowrap px-1 sm:px-2",
            COLUMN_CLASSES[index]
          )}
        >
          {Icon ? (
            <Tooltip>
              <TooltipTrigger asChild>{sortButton}</TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ) : (
            sortButton
          )}
        </TableHead>
      </Fragment>
    );
  });
};
