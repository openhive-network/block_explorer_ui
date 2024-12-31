import { Fragment } from "react";

import {
  Table,
  TableRow,
  TableHeader,
  TableHead,
  TableCell,
  TableBody,
} from "../ui/table";
import { formatNumber, formatPercent } from "@/lib/utils";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import Hive from "@/types/Hive";

const TABLE_CELLS = ["Voter", "Weight", "Rshares", "Percent", "Time"];

const buildTableHeader = () => {
  return TABLE_CELLS.map((cell, index) => {
    return (
      <TableHead
        className="text-left text-[1rem]"
        key={index}
      >
        {cell}
      </TableHead>
    );
  });
};

const buildTableBody = (voteDetails: Hive.PostPageVoteDetails[]) => {
  return voteDetails.map((item, index) => {
    const { voter, weight, rshares, percent, time } = item;

    return (
      <Fragment key={index}>
        <TableRow className="border-b border-gray-700 hover:bg-inherit dark:hover:bg-inherit">
          <TableCell>{voter}</TableCell>
          <TableCell>{formatNumber(weight, false, true)}</TableCell>
          {/* Add wht % if needed*/}
          <TableCell>{formatNumber(rshares, false, true)}</TableCell>
          <TableCell>{formatPercent(percent)}</TableCell>
          <TableCell>{formatAndDelocalizeTime(time)}</TableCell>
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
