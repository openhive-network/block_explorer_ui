import { Fragment } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { grabNumericValue } from "./StringUtils";
import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AllTransfers } from "@/components/account/AccountRecurrentTransfersCard";

type SortedTransfers = {
  transfers: AllTransfers[];
  key: string;
  isAscending: boolean;
};

type KeyMapFn = (t: AllTransfers) => string | number;

export const TABLE_HEADER_CELLS_OUTGOING = [
  "",
  "Recipient",
  "Amount",
  "Recurrence",
  "Remaining",
];
export const TABLE_HEADER_CELLS_INCOMING = [
  "",
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

  return [...transfers].sort((a, b) => {
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
    return (
      <ChevronUp
        size={15}
        className="ml-2"
      />
    );
  } else if (isKeyEqualToCell && !isOrderAscending) {
    return (
      <ChevronDown
        size={15}
        className="ml-2"
      />
    );
  } else {
    return (
      <ChevronsUpDown
        size={15}
        className="ml-2"
      />
    );
  }
};

export const buildTableHead = (
  handleSort: (key: string) => void,
  sortKey: string,
  isOrderAscending: boolean,
  direction?: "incoming" | "outgoing"
) => {
  const tableHeaderCells =
    direction === "incoming"
      ? TABLE_HEADER_CELLS_INCOMING
      : TABLE_HEADER_CELLS_OUTGOING;

  return tableHeaderCells.map((cellName: string) => {
    return (
      <Fragment key={cellName}>
        <TableHead
          key={cellName}
          className="text-right"
        >
          <Button
            className="bg-inherit hover:bg-inherit p-0 m-0"
            onClick={() => handleSort(cellName.toLocaleLowerCase())}
          >
            {cellName} {renderChevron(cellName, sortKey, isOrderAscending)}
          </Button>
        </TableHead>
      </Fragment>
    );
  });
};
