import { useState } from "react";
import Link from "next/link";
import { MoveDown, MoveUp, Loader2 } from "lucide-react";

import { cn, formatNumber } from "@/lib/utils";
import useWitnessVoters from "@/hooks/api/common/useWitnessVoters";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "../ui/switch";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import CustomPagination from "../CustomPagination";
import { config } from "@/Config";

type VotersDialogProps = {
  accountName: string;
  isVotersOpen: boolean;
  changeVotersDialogue: (isOpen: boolean) => void;
  liveDataEnabled: boolean;
};

const tableColums = [
  { key: "voter", name: "Voter" },
  { key: "vests", name: "Votes", isRightAligned: true },
  { key: "account_vests", name: "Account", isRightAligned: true },
  { key: "proxied_vests", name: "Proxy", isRightAligned: true },
];

const VotersDialog: React.FC<VotersDialogProps> = ({
  accountName,
  isVotersOpen,
  changeVotersDialogue,
  liveDataEnabled,
}) => {
  const [sortKey, setSortKey] = useState<string>("vests");
  const [isAsc, setIsAsc] = useState<boolean>(false);
  const [pageNum, setPageNum] = useState<number>(1);

  const { witnessDetails } = useWitnessDetails(accountName, true);
  const { witnessVoters, isWitnessVotersLoading } = useWitnessVoters(
    accountName,
    isVotersOpen,
    isAsc,
    sortKey,
    liveDataEnabled,
    pageNum
  );
  const changeSorter = (newIsAsc: boolean, newSortKey: string) => {
    const isAscForChange = newSortKey === sortKey ? newIsAsc : false;
    setSortKey(newSortKey);
    setIsAsc(isAscForChange);
  };

  const onHeaderClick = (propertyKey: string) => {
    if (!changeSorter) return;

    changeSorter(!isAsc, propertyKey);
  };

  const showSorter = (columnName: string) => {
    if (columnName === sortKey) {
      return isAsc ? <MoveDown /> : <MoveUp />;
    } else return null;
  };

  return (
    <Dialog
      open={isVotersOpen}
      onOpenChange={changeVotersDialogue}
    >
      <DialogContent
        className={`h-3/4 max-w-4xl bg-explorer-bg-start ${
          !witnessVoters && "flex justify-center items-center"
        }`}
        data-testid="voters-dialog"
      >
        {witnessVoters ? (
          <>
            <div
              className="flex justify-center  items-centertext-center font-semibold	"
              data-testid="voters-dialog-witness-name"
            >
              {accountName.toUpperCase()} - Voters
              {isWitnessVotersLoading && (
                <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
              )}
            </div>
            <div className="flex justify-between">
              {witnessDetails && (
                <p>Last updated : {witnessDetails.votes_updated_at}</p>
              )}
            </div>

            <CustomPagination 
              currentPage={pageNum}
              onPageChange={(newPage: number) => {setPageNum(newPage)}}
              pageSize={config.standardPaginationSize}
              totalCount={witnessVoters.total_operations}
              className="text-black dark:text-white"
              isMirrored={false}
            />

            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  {tableColums.map((column, index) => (
                    <TableHead
                      onClick={() => {
                        onHeaderClick(column.key);
                      }}
                      key={column.key}
                      className={cn({
                        "sticky md:static left-0": !index,
                      })}
                    >
                      <span
                        className={cn("flex", {
                          "justify-end": column.isRightAligned,
                        })}
                      >
                        {column.name} {showSorter(column.key)}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody data-testid="voters-dialog-table-body">
                {witnessVoters &&
                  witnessVoters.voters.map((voter, index) => (
                    <TableRow
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-rowEven" : "bg-rowOdd"
                      }`}
                    >
                      <TableCell
                        className={`text-explorer-turquoise sticky md:static left-0 ${
                          index % 2 === 0
                            ? "bg-rowEven md:bg-inherit"
                            : "bg-rowOdd md:bg-inherit"
                        }`}
                      >
                        <Link
                          href={`/@${voter.voter_name}`}
                          data-testid="voter-name"
                        >
                          {voter.voter_name}
                        </Link>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        data-testid="vote-power"
                      >
                        {formatNumber(voter.vests, true)}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        data-testid="account-power"
                      >
                        {formatNumber(voter.account_vests, true)}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        data-testid="proxied-power"
                      >
                        {formatNumber(voter.proxied_vests, true)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <Loader2 className="animate-spin mt-1 h-8 w-8 ml-3 ..." />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VotersDialog;
