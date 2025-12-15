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
import { useI18n } from "@/i18n/i18n";

const buildTableBody = (voteDetails: Hive.PostPageVoteDetails[]) => {
  return voteDetails.map(({ voter, rshares }, index) => (
    <TableRow key={index} className="hover:bg-accent/50">
      <TableCell className="font-medium">
        <Link target="_blank" className="text-link" href={`/@${voter}`}>
          {voter}
        </Link>
      </TableCell>
      <TableCell className="text-right font-mono">
        {formatNumber(rshares, false, true, 0)}
      </TableCell>
    </TableRow>
  ));
};

interface VoteDetailsTableProps {
  isVoteDetailsOpen: boolean;
  voteDetails: Hive.PostPageVoteDetails[];
}

const VoteDetailsTable: React.FC<VoteDetailsTableProps> = ({
  isVoteDetailsOpen,
  voteDetails,
}) => {
  const { t } = useI18n();
  if (!isVoteDetailsOpen || !voteDetails.length) return null;  

  return (
    <div className="rounded-[4px]  border bg-card text-card-foreground overflow-x-auto">
       <div className="p-4 border-b bg-theme">
        <h3 className="text-lg font-semibold">{t("voteDetailsTable.title")}</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t("voteDetailsTable.voter")}</TableHead>
            <TableHead className="text-right">{t("voteDetailsTable.rshares")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{buildTableBody(voteDetails)}</TableBody>
      </Table>
    </div>
  );
};

export default VoteDetailsTable;