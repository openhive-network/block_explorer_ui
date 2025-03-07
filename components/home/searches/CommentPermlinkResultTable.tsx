import React from "react";
import Link from "next/link";
import { SquareArrowDown } from "lucide-react";

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
import useHandleCommentsSearch from "./hooks/useHandleCommentsSearch";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/CopyButton";
import DataExport from "@/components/DataExport";

interface CommentPermlinkResultTableProps {
  data: Hive.Permlink[];
  accountName: string | undefined;
  openCommentsSection: (accountName: string, permlink: string) => void;
}

const TABLE_CELLS = [
  "Block",
  "Operation Id",
  "Permlink",
  "",
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
  handleOpenCommentsSection: (accountName: string, permlink: string) => void
) => {
  if (!data || !data.length || !accountName) return;

  return data.map(
    ({ block, operation_id, permlink, timestamp, trx_id }: any) => {
      return (
        <React.Fragment key={trx_id}>          
          <TableRow className="border-b border-gray-700 hover:bg-inherit p-[10px]">
            <TableCell className="text-left text-link whitespace-nowrap">
              <Link href={`/block/${block}`}>{block.toLocaleString()}</Link>
              <CopyButton
                text={block}
                tooltipText="Copy block number"
              />
            </TableCell>
            <TableCell className="text-left text-text">
              {operation_id}
            </TableCell>
            <TableCell className="text-left text-wrap whitespace-nowrap">
              <Link
                className="text-link"
                target="_blank"
                href={`/@${accountName}/${permlink}`}
              >
                {permlink}
              </Link>
            </TableCell>
            <TableCell className="text-left text-text p-0 m-0">
              <Button
                className="bg-inherit p-2"
                onClick={() => handleOpenCommentsSection(accountName, permlink)}
              >
                <SquareArrowDown size="20" />
              </Button>
            </TableCell>
            <TableCell className="text-left text-text">
              {formatAndDelocalizeTime(timestamp)}
            </TableCell>
            <TableCell className="text-left text-link whitespace-nowrap">
              <Link href={`/transaction/${trx_id}`}>{trx_id?.slice(0, 10)}</Link>
              <CopyButton
                text={trx_id}
                tooltipText="Copy transaction ID"
              />
            </TableCell>
          </TableRow>
        </React.Fragment>
      );
    }
  );
};

const CommentPermlinkResultTable = ({
  openCommentsSection,
  data,
  accountName,
}: CommentPermlinkResultTableProps) => {
  const { handleCommentsSearch } = useHandleCommentsSearch();

  const handleOpenCommentsSection = (accountName: string, permlink: string) => {
    handleCommentsSearch(accountName, permlink);
    openCommentsSection(accountName, permlink);
  };

  const prepareExportData = () => {
    if (!data || !data.length || !accountName) return [];
  
    return data.map(({ block, operation_id, permlink, timestamp, trx_id }: any) => {
 
      return {
        Block: block.toLocaleString(),
        "Operation Id": operation_id,
        Permlink: permlink,
        Timestamp: formatAndDelocalizeTime(timestamp),
        "Trx Id": trx_id?.slice(0, 10),
      };
    });
  };

  return (
    <>
    <div className="w-full">
      <div className="flex justify-end">
        <DataExport
            data={prepareExportData()}
            filename={`${accountName}_permlink_search_result.csv`}
            className="mb-2"
        />
      </div>
    </div>
      <div className="flex w-full overflow-auto">
        <div className="text-text w-[100%] bg-theme dark:bg-theme p-5 rounded">
          <Table data-testid="table-body">
            <TableHeader>
              <TableRow>{buildTableHeader()}</TableRow>
            </TableHeader>
            <TableBody>
              {buildTableBody(data, accountName, handleOpenCommentsSection)}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default CommentPermlinkResultTable;
