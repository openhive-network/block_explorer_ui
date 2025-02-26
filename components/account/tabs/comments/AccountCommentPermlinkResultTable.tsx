import { Fragment } from "react";
import Link from "next/link";

import {
  TableHead,
  TableRow,
  TableCell,
  Table,
  TableHeader,
  TableBody,
} from "@/components/ui/table";
import Hive from "@/types/Hive";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";

import { useTabs } from "@/contexts/TabsContext";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { SquareArrowOutUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHandleInteractionsSearch } from "../interactions/useHandleInteractionsSearch";

interface AccountCommentPermlinkResultTableProps {
  data: Hive.Permlink[];
  accountName: string | undefined;
}

const TABLE_CELLS = [
  "Block",
  "Operation Id",
  "Permlink",
  "",
  "Timestamp",
  "Trx Id",
];

let timeout: string | number | NodeJS.Timeout | undefined;

const onScrollDebounced = () => {
  if (timeout) clearTimeout(timeout);

  timeout = setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, 200);
};

const buildTableHeader = () => {
  return TABLE_CELLS.map((cell, index) => {
    return (
      <TableHead
        className="text-left text-[1.2rem]"
        key={index}
      >
        {cell}
      </TableHead>
    );
  });
};

const buildTableBody = (
  data: Hive.Permlink[],
  accountName: string | undefined,
  showCommentsByPermlink: (permlink: string) => void
) => {
  if (!data || !data.length || !accountName) return;

  return data.map(({ block, operation_id, permlink, timestamp, trx_id }) => {
    const handleShowCommentsByPermlink = () => {
      onScrollDebounced();
      showCommentsByPermlink(permlink);
    };

    return (
      <Fragment key={trx_id}>
        <TableRow className="border-b border-gray-700  hover:bg-inherit p-[10px]">
          <TableCell className="text-left text-link">
            <Link href={`/block/${block}`}>{block}</Link>
          </TableCell>
          <TableCell className="text-left text-text">{operation_id}</TableCell>
          <TableCell className="text-left text-wrap whitespace-nowrap">
            <Link
              className="text-link"
              href={`/@${accountName}/${permlink}`}
              target="_blank"
            >
              {permlink}
            </Link>
          </TableCell>
          <TableCell className="text-left p-0 m-0 text-text">
            <Button
              className="bg-inherit p-2"
              onClick={handleShowCommentsByPermlink}
            >
              <SquareArrowOutUpRight size="20" />
            </Button>
          </TableCell>
          <TableCell className="text-left text-text">
            {formatAndDelocalizeTime(timestamp)}
          </TableCell>
          <TableCell className="text-left text-link">
            <Link href={`/transaction/${trx_id}`}>{trx_id}</Link>
          </TableCell>
        </TableRow>
      </Fragment>
    );
  });
};

const AccountCommentPermlinkResultTable = ({
  data,
  accountName,
}: AccountCommentPermlinkResultTableProps) => {
  const { setActiveTab } = useTabs();

  const { setCommentsSearchPermlink } = useSearchesContext();
  const { handleCommentsSearch } = useHandleInteractionsSearch();

  const showCommentsByPermlink = (permlink: string) => {
    setCommentsSearchPermlink(permlink);
    setActiveTab("interactions");
    handleCommentsSearch(accountName as string, permlink);
  };

  return (
    <>
      <div className="flex w-full overflow-auto">
        <div className="text-text w-[100%] bg-theme p-5">
          <Table data-testid="table-body">
            <TableHeader>
              <TableRow>{buildTableHeader()}</TableRow>
            </TableHeader>
            <TableBody>
              {buildTableBody(data, accountName, showCommentsByPermlink)}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default AccountCommentPermlinkResultTable;
