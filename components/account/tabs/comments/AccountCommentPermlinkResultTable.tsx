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
import CopyButton from "@/components/ui/CopyButton";
import DataExport from "@/components/DataExport";
import { cn } from "@/lib/utils";
import DataCountMessage from "@/components/DataCountMessage";

interface AccountCommentPermlinkResultTableProps {
  permlinkCount: number;
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
          <TableCell className="text-left text-link whitespace-nowrap">
            <Link href={`/block/${block}`}>{block.toLocaleString()}</Link>
            <CopyButton
              text={block}
              tooltipText="Copy block number"
            />
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
          <TableCell className="text-left text-link whitespace-nowrap">
            <Link href={`/transaction/${trx_id}`}>{trx_id?.slice(0, 10)}</Link>
            <CopyButton
              text={trx_id}
              tooltipText="Copy transaction ID"
            />
          </TableCell>
        </TableRow>
      </Fragment>
    );
  });
};

const AccountCommentPermlinkResultTable = ({
  permlinkCount,
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

  const prepareExportData = () => {
    if (!data || !data.length || !accountName) return [];

    return data.map(
      ({ block, operation_id, permlink, timestamp, trx_id }: any) => {
        return {
          Block: block.toLocaleString(),
          "Operation Id": operation_id,
          Permlink: permlink,
          Timestamp: formatAndDelocalizeTime(timestamp),
          "Trx Id": trx_id?.slice(0, 10),
        };
      }
    );
  };

  return (
    <>
      <div className="w-full">
        <div
          className={cn("flex justify-end items-center", {
            "justify-between": !!permlinkCount,
          })}
        >
          <DataCountMessage
            count={permlinkCount}
            dataType="permlinks"
          />
          <DataExport
            data={prepareExportData()}
            filename={`${accountName}_comments.csv`}
            className="mb-2"
          />
        </div>
      </div>
      <div className="flex w-full overflow-auto rounded">
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
