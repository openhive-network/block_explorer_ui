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
import { useI18n } from "@/i18n/i18n";

interface AccountCommentPermlinkResultTableProps {
  permlinkCount: number;
  data: Hive.Permlink[];
  accountName: string | undefined;
}

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

const buildTableHeader = (t: (key: string) => string) => {
  const TABLE_CELL_KEYS = [
    "commentPermlinkResultTable.block",
    "commentPermlinkResultTable.operationId",
    "commentPermlinkResultTable.permlink",
    "",
    "commentPermlinkResultTable.timestamp",
    "commentPermlinkResultTable.trxId",
  ];
  return (
    <TableRow rowVariant="header">
      {TABLE_CELL_KEYS.map((cellKey, index) => (
        <TableHead
          key={cellKey}
          stickyLeft={index === 0 ? true : undefined}
        >
          {cellKey ? t(cellKey) : ""}
        </TableHead>
      ))}
    </TableRow>
  );
};

const buildTableBody = (
  data: Hive.Permlink[],
  accountName: string | undefined,
  showCommentsByPermlink: (permlink: string) => void,
  t: (key: string) => string
) => {
  if (!data || !data.length || !accountName) return;

  return data.map(({ block, operation_id, permlink, timestamp, trx_id }) => {
    const handleShowCommentsByPermlink = () => {
      onScrollDebounced();
      showCommentsByPermlink(permlink);
    };

    return (
      <Fragment key={trx_id}>
        <TableRow>
          <TableCell
            stickyLeft
            className="text-link whitespace-nowrap"
          >
            <Link href={`/block/${block}`}>{block.toLocaleString()}</Link>
            <CopyButton
              text={block}
              tooltipText={t("common.copyBlockNumber")}
            />
          </TableCell>
          <TableCell>{operation_id}</TableCell>
          <TableCell className="text-link text-wrap whitespace-nowrap max-w-36">
            <Link
              className="text-link break-words"
              href={`/@${accountName}/${permlink}`}
              target="_blank"
            >
              {permlink}
            </Link>
          </TableCell>
          <TableCell className="p-0 m-0">
            <Button
              className="bg-inherit p-2"
              onClick={handleShowCommentsByPermlink}
            >
              <SquareArrowOutUpRight size="20" />
            </Button>
          </TableCell>
          <TableCell>{formatAndDelocalizeTime(timestamp)}</TableCell>
          <TableCell className="text-link whitespace-nowrap">
            <Link href={`/transaction/${trx_id}`}>{trx_id?.slice(0, 10)}</Link>
            <CopyButton
              text={trx_id}
              tooltipText={t("common.copyTransactionId")}
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
  const { t } = useI18n();
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
              "accountOperationViewTabs.comments"
            ).toLowerCase()}.csv`}
            className="mb-2"
          />
        </div>
      </div>
      <div className="flex w-full overflow-auto rounded">
        <div className="text-text w-[100%] bg-theme">
          <Table enableMobileScrollArrows>
            <TableHeader>{buildTableHeader(t)}</TableHeader>

            <TableBody>
              {buildTableBody(data, accountName, showCommentsByPermlink, t)}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default AccountCommentPermlinkResultTable;
