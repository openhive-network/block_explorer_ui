import { Fragment } from "react";
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
  handleRowClick: (block: number, trx_id: string, operation_id: bigint) => void,
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
        <TableRow 
            className="cursor-pointer hover:bg-rowHover"
            onClick={() => handleRowClick(block, trx_id, BigInt(operation_id))}
        >
          <TableCell
            stickyLeft
            className="text-link whitespace-nowrap"
          >
            <Link href={`/block/${block}`} onClick={(e) => e.stopPropagation()}>
              {block.toLocaleString()}
            </Link>
            <CopyButton
              text={String(block)}
              tooltipText={t("common.copyBlockNumber")}
              onClick={(e) => e.stopPropagation()} 
            />
          </TableCell>
          <TableCell>{operation_id}</TableCell>
          <TableCell className="text-link text-wrap whitespace-nowrap max-w-36">
            <Link
              className="text-link break-words"
              href={`/@${accountName}/${permlink}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              {permlink}
            </Link>
          </TableCell>
          <TableCell className="p-0 m-0">
            <Button
              className="bg-inherit p-2"
              onClick={(e) => {
                e.stopPropagation();
                handleShowCommentsByPermlink();
              }}
            >
              <SquareArrowOutUpRight size="20" />
            </Button>
          </TableCell>
          <TableCell>{formatAndDelocalizeTime(timestamp)}</TableCell>
          <TableCell className="text-link whitespace-nowrap">
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
      </Fragment>
    );
  });
};

const AccountCommentPermlinkResultTable = ({
  permlinkCount,
  data,
  accountName,
}: AccountCommentPermlinkResultTableProps) => {
  const router = useRouter(); 
  const { t } = useI18n();
  const { setActiveTab } = useTabs();

  const { setCommentsSearchPermlink } = useSearchesContext();
  const { handleCommentsSearch } = useHandleInteractionsSearch();

  const handleRowClick = (block: number, trx_id: string, operation_id: bigint) => {
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
              {buildTableBody(data, accountName, showCommentsByPermlink, handleRowClick, t)}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default AccountCommentPermlinkResultTable;