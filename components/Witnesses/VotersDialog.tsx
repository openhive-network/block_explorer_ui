import { useState, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Hive from "@/types/Hive";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { MoveDown, MoveUp } from "lucide-react";
import { Switch } from "../ui/switch";


type VotersDialogProps = {
  accountName: string;
  isVotersOpen: boolean;
  voters: Hive.Voter[] | null;
  sorterInfo: {isAsc: boolean, sortKey: string}
  changeVotersDialogue: (isOpen: boolean) => void,
  changeSorter: (newIsAsc: boolean, newSortKey: string) => void,
};

const tableColums = [
  {key: "voter", name: "Voter"},
  {key: "vests", name: "Votes"},
  {key: "account_vests", name: "Account"},
  {key: "proxied_vests", name: "Proxy"},
]

const VotersDialog: React.FC<VotersDialogProps> = ({
  accountName,
  isVotersOpen,
  voters,
  sorterInfo,
  changeVotersDialogue,
  changeSorter
}) => {

  const [showHivePower, setShowHivePower] = useState<boolean>(false);

  const onHeaderClick = (propertyKey: string) => {
    changeSorter(!sorterInfo.isAsc, propertyKey);
  }

  const showSorter = (columnName: string) => {
    if (columnName === sorterInfo.sortKey) {
      return sorterInfo.isAsc ? <MoveDown /> : <MoveUp />
    } else return null;
  }

  return (
    <Dialog open={isVotersOpen} onOpenChange={changeVotersDialogue}>
      <DialogContent className="h-3/4 max-w-2xl overflow-auto bg-white" >
        <div className="text-center font-semibold	">{accountName}</div>
        <div className="flex"><label>Vests</label><Switch className="mx-2" checked={showHivePower} onCheckedChange={setShowHivePower}  /><label>Hive Power</label></div>
        <Table >
          <TableHeader>
            <TableRow >
              {tableColums.map((column) => (
                <TableHead onClick={() => {onHeaderClick(column.key)}} key={column.key}><span className="flex">{column.name} {showSorter(column.key)}</span></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {voters && voters?.map((voter, index) => (
              <TableRow key={index} className={`${index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"}`}>
                <TableCell className=' text-blue-600'><Link href={`/account/${voter.voter}`}>{voter.voter}</Link></TableCell>
                <TableCell >{showHivePower ? voter.votes_hive_power : voter.vests.toLocaleString()} </TableCell>
                <TableCell >{showHivePower ? voter.account_hive_power : voter.account_vests.toLocaleString()} </TableCell>
                <TableCell >{showHivePower ? voter.proxied_hive_power : voter.proxied_vests.toLocaleString()} </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default VotersDialog;
