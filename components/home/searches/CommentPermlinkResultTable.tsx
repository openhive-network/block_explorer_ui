import React from "react";
import { useRouter } from "next/router";
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

import { Button } from "@/components/ui/button";
import { useTabs } from "@/contexts/TabsContext";
import { useSearchesContext } from "@/contexts/SearchesContext";

interface CommentPermlinkResultTableProps {
  data: Hive.Permlink[];
  accountName: string | undefined;
  buildLink: (accountName: string, permlink: string) => {};
}

const TABLE_CELLS = [
  "Block",
  "Operation Id",
  "Permlink",
  "Timestamp",
  "Trx Id",
];

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
  buildLink: (accountName: string, permlink: string) => {},
  isAccountPage: boolean,
  //Open comments tab only when permlink is clicked on account page
  showCommentsByPermlink: (permlink: string) => void
) => {
  if (!data || !data.length || !accountName) return;

  return data.map(
    ({ block, operation_id, permlink, timestamp, trx_id }: any) => {
      const linkToCommentsPage = buildLink(accountName, permlink);

      return (
        <React.Fragment key={trx_id}>
          <TableRow className="border-b border-gray-700 hover:bg-inherit p-[10px]">
            <TableCell className="text-left text-link">
              <Link href={`/block/${block}`}>{block}</Link>
            </TableCell>
            <TableCell className="text-left text-text">
              {operation_id}
            </TableCell>
            <TableCell className="text-center text-link">
              {isAccountPage ? (
                <Button
                  className="bg-inherit"
                  onClick={() => showCommentsByPermlink(permlink)}
                >
                  {permlink}
                </Button>
              ) : (
                <Link href={linkToCommentsPage}>{permlink}</Link>
              )}
            </TableCell>
            <TableCell className="text-left text-text">
              {formatAndDelocalizeTime(timestamp)}
            </TableCell>
            <TableCell className="text-left text-link">
              <Link href={`/transaction/${trx_id}`}> {trx_id}</Link>
            </TableCell>
          </TableRow>
        </React.Fragment>
      );
    }
  );
};

const CommentPermlinkResultTable = ({
  buildLink,
  data,
  accountName,
}: CommentPermlinkResultTableProps) => {
  const router = useRouter();
  const isAccountPage = Boolean(router.query.accountName) || false;

  const { setActiveTab } = useTabs();
  const { setCommentsSearchPermlink } = useSearchesContext();

  const showCommentsByPermlink = (permlink: string) => {
    setCommentsSearchPermlink(permlink);
    setActiveTab("comments");
  };

  return (
    <>
      <div className="flex w-full overflow-auto">
        <div className="text-text w-[100%] bg-theme dark:bg-theme p-5">
          <Table data-testid="table-body">
            <TableHeader>
              <TableRow>{buildTableHeader()}</TableRow>
            </TableHeader>
            <TableBody>
              {buildTableBody(
                data,
                accountName,
                buildLink,
                isAccountPage,
                showCommentsByPermlink
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default CommentPermlinkResultTable;
