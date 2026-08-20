import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

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
import ViewCommentsButton from "@/components/ui/ViewCommentsButton";
import CopyButton from "@/components/ui/CopyButton";
import DataExport from "@/components/DataExport";
import { cn } from "@/lib/utils";
import DataCountMessage from "@/components/DataCountMessage";
import { useI18n } from "@/i18n/i18n";

interface CommentPermlinkResultTableProps {
  permlinkCount: number;
  data: Hive.Permlink[];
  accountName: string | undefined;
  openCommentsSection: (accountName: string, permlink: string) => void;
}

const TABLE_CELL_KEYS = [
  "commentPermlinkResultTable.block",
  "commentPermlinkResultTable.operationId",
  "commentPermlinkResultTable.permlink",
  "", // Empty for the button column
  "commentPermlinkResultTable.timestamp",
  "commentPermlinkResultTable.trxId",
];

const buildTableHeader = (t: (key: string) => string) => {
  return TABLE_CELL_KEYS.map((cellKey, index) => {
    return (
      <TableHead
        stickyLeft={index === 0 ? true : undefined}
        className="text-left text-sm"
        key={cellKey || `empty-header-${index}`} // Ensure unique key for empty header
      >
        {cellKey ? t(cellKey) : ""}
      </TableHead>
    );
  });
};

const buildTableBody = (
  data: Hive.Permlink[],
  accountName: string | undefined,
  handleOpenCommentsSection: (accountName: string, permlink: string) => void,
  handleRowClick: (block: number, trx_id: string, operation_id: number) => void,
  t: (key: string) => string
) => {
  if (!data || !data.length || !accountName) return;

  return data.map(
    (
      { block, operation_id, permlink, timestamp, trx_id }: any,
      index: number
    ) => {
      // Added index for key
      return (
        <React.Fragment key={trx_id || index}>
          <TableRow
            className="cursor-pointer hover:bg-rowHover"
            onClick={() => handleRowClick(block, trx_id, operation_id)}
          >
            <TableCell stickyLeft className="text-link whitespace-nowrap">
              <Link
                href={`/block/${block}`}
                onClick={(e) => e.stopPropagation()}
              >
                {block.toLocaleString()}
              </Link>
              <CopyButton
                text={block}
                tooltipText={t("common.copyBlockNumber")}
                onClick={(e) => e.stopPropagation()}
              />
            </TableCell>
            <TableCell>{operation_id}</TableCell>
            <TableCell className="text-wrap whitespace-nowrap max-w-36">
              <Link
                className="text-link break-words"
                target="_blank"
                href={`/@${accountName}/${permlink}`}
                onClick={(e) => e.stopPropagation()}
              >
                {permlink}
              </Link>
            </TableCell>
            <TableCell className="text-left text-text p-0 m-0">
              <ViewCommentsButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCommentsSection(accountName, permlink);
                }}
              />
            </TableCell>
            <TableCell className="text-left text-text">
              {formatAndDelocalizeTime(timestamp)}
            </TableCell>
            <TableCell className="text-left text-link whitespace-nowrap">
              <Link href={`/tx/${trx_id}`} onClick={(e) => e.stopPropagation()}>
                {trx_id?.slice(0, 10)}
              </Link>
              <CopyButton
                text={trx_id}
                tooltipText={t("common.copyTransactionId")}
                onClick={(e) => e.stopPropagation()}
              />
            </TableCell>
          </TableRow>
        </React.Fragment>
      );
    }
  );
};

const CommentPermlinkResultTable = ({
  permlinkCount,
  openCommentsSection,
  data,
  accountName,
}: CommentPermlinkResultTableProps) => {
  const router = useRouter();
  const { t } = useI18n();
  const { handleCommentsSearch } = useHandleCommentsSearch();

  const handleOpenCommentsSection = (accountName: string, permlink: string) => {
    handleCommentsSearch(accountName, permlink);
    openCommentsSection(accountName, permlink);
  };

  const handleRowClick = (
    block: number,
    trx_id: string,
    operation_id: number
  ) => {
    const params = new URLSearchParams();
    if (trx_id) {
      params.append("trxId", trx_id);
    }
    if (operation_id !== undefined) {
      params.append("opId", String(operation_id));
    }
    const queryString = params.toString();
    const url = `/block/${block}${queryString ? `?${queryString}` : ""}`;
    router.push(url);
  };

  const prepareExportData = () => {
    if (!data || !data.length || !accountName) return [];

    return data.map(
      ({ block, operation_id, permlink, timestamp, trx_id }: any) => {
        return {
          [t("commentPermlinkResultTable.block")]: block.toLocaleString(),
          [t("commentPermlinkResultTable.operationId")]: operation_id,
          [t("commentPermlinkResultTable.permlink")]: permlink,
          [t("commentPermlinkResultTable.timestamp")]:
            formatAndDelocalizeTime(timestamp),
          [t("commentPermlinkResultTable.trxId")]: trx_id?.slice(0, 10),
        };
      }
    );
  };

  return (
    <>
      <div className="w-full">
        <div
          className={cn("table-toolbar", {
            "justify-between": !!permlinkCount,
          })}
        >
          <DataCountMessage
            count={permlinkCount}
            dataType={t("commentPermlinkResultTable.permlinksDataType")}
          />
          <DataExport
            data={prepareExportData()}
            filename={`${accountName}_${t(
              "commentPermlinkResultTable.permlink_search_result"
            ).toLowerCase()}.csv`}
            className="mb-2"
          />
        </div>
      </div>
      <div className="flex w-full overflow-auto">
        <div className="text-text w-[100%] bg-theme dark:bg-theme p-5 rounded">
          <Table
            enableMobileScrollArrows
            data-testid="table-body"
            className="text-xs"
          >
            <TableHeader>
              <TableRow rowVariant="header">{buildTableHeader(t)}</TableRow>
            </TableHeader>
            <TableBody>
              {buildTableBody(
                data,
                accountName,
                handleOpenCommentsSection,
                handleRowClick,
                t
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default CommentPermlinkResultTable;
