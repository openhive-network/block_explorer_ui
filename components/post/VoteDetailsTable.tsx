import { Fragment } from "react";
import Link from "next/link";

import {
  Table,
  TableRow,
  TableHeader,
  TableHead,
  TableCell,
  TableBody,
} from "../ui/table";
import { cn, formatNumber } from "@/lib/utils";
import Hive from "@/types/Hive";

const TABLE_CELLS = ["Voter", "Rshares"];

const buildTableHeader = () => {
  return TABLE_CELLS.map((cell, index) => {
    return (
      <TableHead
        className={cn("text-right text-[1rem]", {
          "text-left": index === 0 || index === TABLE_CELLS.length - 1,
        })}
        key={index}
      >
        {cell}
      </TableHead>
    );
  });
};

const buildTableBody = (voteDetails: Hive.PostPageVoteDetails[]) => {
  return voteDetails.map((item, index) => {
    const { voter, rshares } = item;

    return (
      <Fragment key={index}>
        <TableRow className="border-b border-gray-700 hover:bg-inherit dark:hover:bg-inherit">
          <TableCell>
            <Link
              target="_blank"
              className="text-link"
              href={`/@${voter}`}
            >
              {voter}
            </Link>
          </TableCell>
          <TableCell className="text-left">
            {formatNumber(rshares, false, true)}
          </TableCell>
        </TableRow>
      </Fragment>
    );
  });
};

interface VoteDetailsTableProps {
  isVoteDetailsOpen: boolean;
  voteDetails: Hive.PostPageVoteDetails[];
}

const VoteDetailsTable: React.FC<VoteDetailsTableProps> = ({
  isVoteDetailsOpen,
  voteDetails,
}) => {
  if (!isVoteDetailsOpen || !voteDetails.length) return null;

  return (
    <div className="mt-2 mx-5">
      <Table>
        <TableHeader>
          <TableRow>{buildTableHeader()}</TableRow>
        </TableHeader>
        <TableBody>{buildTableBody(voteDetails)}</TableBody>
      </Table>
    </div>
  );
};

export default VoteDetailsTable;
