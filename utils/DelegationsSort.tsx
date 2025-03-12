//HP and RC Delegations table sort on account page

import { Fragment } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import Explorer from "@/types/Explorer";
import { grabNumericValue } from "./StringUtils";
import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export type RcDelegation = {
  to: string;
  delegated_rc: number;
};

type SortedDelegations = {
  delegations: Explorer.VestingDelegation[] | RcDelegation[];
  key: string;
  isAscending: boolean;
  recipient: string;
  amount: string | number;
};

export const TABLE_HEADER_CELLS_OUTGOING = ["", "Recipient", "Amount"];
export const TABLE_HEADER_CELLS_INCOMING = ["", "Delegator", "Amount"];

export const handleSortDelegations = ({
  delegations,
  key,
  isAscending,
  recipient,
  amount,
}: SortedDelegations) => {
  return [...delegations].sort((a: any, b: any) => {
    if (key === "recipient" || key === "delegator") {
      const delegateeA = a[recipient].toLowerCase();
      const delegateeB = b[recipient].toLowerCase();
      return isAscending
        ? delegateeA.localeCompare(delegateeB)
        : delegateeB.localeCompare(delegateeA);
    } else if (key === "amount") {
      if (typeof a[amount] === "string") {
        return isAscending
          ? grabNumericValue(a[amount]) - grabNumericValue(b[amount])
          : grabNumericValue(b[amount]) - grabNumericValue(a[amount]);
      } else {
        return isAscending ? a[amount] - b[amount] : b[amount] - a[amount];
      }
    }

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
    direction === "outgoing"
      ? TABLE_HEADER_CELLS_OUTGOING
      : TABLE_HEADER_CELLS_INCOMING;

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
