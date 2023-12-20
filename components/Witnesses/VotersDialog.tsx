import { useState } from "react";
import Link from "next/link";
import { MoveDown, MoveUp, Loader2 } from "lucide-react";
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
import { cn, formatNumber } from "@/lib/utils";
import useWitnessVoters from "@/api/common/useWitnessVoters";

type VotersDialogProps = {
  accountName: string;
  isVotersOpen: boolean;
  changeVotersDialogue: (isOpen: boolean) => void;
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
  changeVotersDialogue,
}) => {
  const [showHivePower, setShowHivePower] = useState<boolean>(false);
  const [sortKey, setSortKey] = useState<string>("vests");
  const [isAsc, setIsAsc] = useState<boolean>(false);

  const { witnessVoters, isWitnessVotersLoading } = useWitnessVoters(
    accountName,
    isVotersOpen,
    isAsc,
    sortKey
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
        className={`h-3/4 max-w-3xl overflow-auto bg-white ${
          !witnessVoters && "flex justify-center items-center"
        }`}
      >
        {witnessVoters ? (
          <>
            <div className="flex  justify-center  items-centertext-center font-semibold	">
              {accountName}{" "}
              {isWitnessVotersLoading && (
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
                      <span className="flex">
                        {column.name} {showSorter(column.key)}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {witnessVoters &&
                  witnessVoters.map((voter, index) => (
                    <TableRow
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                      }`}
                    >
                      <TableCell
                        className={`text-explorer-turquoise sticky md:static left-0 ${
                          index % 2 === 0
                            ? "bg-gray-800 md:bg-inherit"
                            : "bg-gray-900 md:bg-inherit"
                        }`}
                      >
                        <Link href={`/account/${voter.voter}`}>
                          {voter.voter}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {showHivePower
                          ? formatNumber(voter.votes_hive_power, false)
                          : formatNumber(voter.vests, true)
                        }
                      </TableCell>
                      <TableCell>
                        {showHivePower
                          ? formatNumber(voter.account_hive_power, false)
                          : formatNumber(voter.account_vests, true)
                        }
                      </TableCell>
                      <TableCell>
                        {showHivePower
                          ? formatNumber(voter.proxied_hive_power, false)
                          : formatNumber(voter.proxied_vests, true)
                        }
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
