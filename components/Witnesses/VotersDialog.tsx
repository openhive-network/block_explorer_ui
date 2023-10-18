import { useState } from "react";
import Link from "next/link";
import { MoveDown, MoveUp, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Hive from "@/types/Hive";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";

type VotersDialogProps = {
  accountName: string;
  isVotersOpen: boolean;
  voters: Hive.Voter[] | undefined;
  sorterInfo: { isAsc: boolean; sortKey: string };
  loading?: boolean;
  changeVotersDialogue: (isOpen: boolean) => void;
  changeSorter?: (newIsAsc: boolean, newSortKey: string) => void;
};

const tableColums = [
  { key: "voter", name: "Voter" },
  { key: "vests", name: "Votes" },
  { key: "account_vests", name: "Account" },
  { key: "proxied_vests", name: "Proxy" },
];

const VotersDialog: React.FC<VotersDialogProps> = ({
  accountName,
  isVotersOpen,
  voters,
  sorterInfo,
  loading,
  changeVotersDialogue,
  changeSorter,
}) => {
  const [showHivePower, setShowHivePower] = useState<boolean>(false);

  const onHeaderClick = (propertyKey: string) => {
    if (changeSorter) changeSorter(!sorterInfo.isAsc, propertyKey);
  };

  const showSorter = (columnName: string) => {
    if (columnName === sorterInfo.sortKey) {
      return sorterInfo.isAsc ? <MoveDown /> : <MoveUp />;
    } else return null;
  };

  return (
    <Dialog
      open={isVotersOpen}
      onOpenChange={changeVotersDialogue}
    >
      <DialogContent className="h-3/4 max-w-2xl overflow-auto bg-white">
        <div className="flex  justify-center  items-centertext-center font-semibold	">
          {accountName}{" "}
          {loading && (
            <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
          )}
        </div>
        <div className="flex">
          <label>Vests</label>
          <Switch
            className="mx-2"
            checked={showHivePower}
            onCheckedChange={setShowHivePower}
          />
          <label>Hive Power</label>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {tableColums.map((column, index) => (
                <TableHead
                  onClick={() => {
                    onHeaderClick(column.key);
                  }}
                  key={column.key}
                  className={cn({
                    "sticky left-0 bg-white": !index,
                  })}
                >
                  <span className="flex text-black">
                    {column.name} {showSorter(column.key)}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {voters &&
              voters?.map((voter, index) => (
                <TableRow
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                  }`}
                >
                  <TableCell
                    className={`text-blue-600 sticky left-0 bg-explorer-bg-start ${
                      index % 2 === 0 ? "bg-gray-50 md:bg-inherit" : "bg-gray-200 md:bg-inherit"
                    }`}
                  >
                    <Link href={`/account/${voter.voter}`}>{voter.voter}</Link>
                  </TableCell>
                  <TableCell>
                    {showHivePower
                      ? voter.votes_hive_power
                      : voter.vests.toLocaleString()}{" "}
                  </TableCell>
                  <TableCell>
                    {showHivePower
                      ? voter.account_hive_power
                      : voter.account_vests.toLocaleString()}{" "}
                  </TableCell>
                  <TableCell>
                    {showHivePower
                      ? voter.proxied_hive_power
                      : voter.proxied_vests.toLocaleString()}{" "}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default VotersDialog;
