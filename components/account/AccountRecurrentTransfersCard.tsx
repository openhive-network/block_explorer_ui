import { useState, Fragment } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
} from "../ui/table";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { capitalizeFirst } from "@/utils/StringUtils";
import {
  buildTableHead,
  handleSortTransfers,
} from "@/utils/RecurrentTransfersSort";
import Hive from "@/types/Hive";
import { useI18n } from "../../i18n/i18n";
import DataExport from "../DataExport";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import {
  formatAndDelocalizeFromTime,
  formatBlockchainTime,
  formatShortDuration,
} from "@/utils/TimeUtils";
import useCollapsedState from "@/hooks/common/useCollapsedState";

type BaseTransfer = Omit<Hive.IncomingRecurrentTransfer, "from" | "amount"> &
  Omit<Hive.OutgoingRecurrentTransfer, "to" | "amount"> & {
    amount: string;
  };

export type AllTransfers =
  | (BaseTransfer & { direction: "incoming"; to: string })
  | (BaseTransfer & { direction: "outgoing"; from: string });

type AccountRecurrentTransfersCardProps = {
  direction: "incoming" | "outgoing";
  transfers: AllTransfers[];
  isInitiallyOpen?: boolean;
  accountName: string;
};

const AccountRecurrentTransfersCard: React.FC<
  AccountRecurrentTransfersCardProps
> = ({ direction, transfers, isInitiallyOpen, accountName }) => {
  const { t, locale } = useI18n();
  const [isPropertiesHidden, setIsPropertiesHidden] =
    useCollapsedState(isInitiallyOpen);
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    isAscending: boolean;
  }>({
    key: direction === "outgoing" ? "recipient" : "sender",
    isAscending: true,
  });

  const { key, isAscending } = sortConfig;

  if (!hiveChain || !transfers || !transfers?.length) return;

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  const sortBy = (key: string) => {
    setSortConfig({ key, isAscending: !isAscending });
  };

  const sortedTransfers = handleSortTransfers({
    transfers,
    key,
    isAscending,
  });

  // The chain stores the interval in hours.
  const formatRecurrence = (hours: number) =>
    formatShortDuration(hours * 3600, locale);

  // After this many failed payments in a row the chain cancels the transfer.
  const maxFailures =
    dynamicGlobalData?.headBlockDetails
      ?.maxConvecutiveRecurrentTransferFailures;

  const buildTableBody = (rows: AllTransfers[]) =>
    rows.map((transfer) => {
      const counterparty = "to" in transfer ? transfer.to : transfer.from;
      const rowKey = `${counterparty}-${transfer.pair_id}`;
      const isExpanded = expandedRow === rowKey;
      const failures = transfer.consecutive_failures;
      const failuresLabel = `${t(
        "accountRecurrentTransfersCard.failures"
      )}: ${failures.toLocaleString(locale)}`;
      return (
        <Fragment key={rowKey}>
          <TableRow className={isExpanded ? "border-b-0" : undefined}>
            {/* The name is never shortened; the other columns give way instead. */}
            <TableCell className="whitespace-nowrap px-1 sm:px-2">
              <Link className="text-link" href={`/@${counterparty}`}>
                {counterparty}
              </Link>
              {failures > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <sup aria-label={failuresLabel} className="ms-0.5">
                      <AlertTriangle
                        className="inline h-3 w-3"
                        color="#ef4444"
                      />
                    </sup>
                  </TooltipTrigger>
                  <TooltipContent>{failuresLabel}</TooltipContent>
                </Tooltip>
              )}
            </TableCell>
            <TableCell className="px-1 text-end sm:whitespace-nowrap sm:px-2">
              {transfer.amount}
            </TableCell>
            <TableCell className="whitespace-nowrap px-1 text-center">
              {formatRecurrence(transfer.recurrence)}
            </TableCell>
            <TableCell className="whitespace-nowrap px-1 text-center">
              {transfer.remaining_executions.toLocaleString(locale)}
            </TableCell>
            <TableCell className="w-px px-0">
              <button
                type="button"
                onClick={() => setExpandedRow(isExpanded ? null : rowKey)}
                aria-expanded={isExpanded}
                aria-label={t("balanceHistoryTable.details")}
                className="flex h-7 w-7 items-center justify-center rounded-md text-link hover:bg-rowHover"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </TableCell>
          </TableRow>
          {isExpanded && (
            <TableRow>
              <TableCell colSpan={5} className="px-1 pb-3 pt-0 sm:px-2">
                {/* w-0 + min-w-full: the box follows the table width and never stretches it. */}
                <dl className="grid w-0 min-w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border border-navbar-border p-3 text-xs">
                  <dt className="text-gray-500 dark:text-gray-400">
                    {t("accountRecurrentTransfersCard.nextExecution")}
                  </dt>
                  <dd>
                    {formatAndDelocalizeFromTime(transfer.trigger_date, locale)}
                    <span className="block text-gray-500 dark:text-gray-400">
                      <span dir="ltr">
                        {formatBlockchainTime(transfer.trigger_date)}
                      </span>
                    </span>
                  </dd>
                  <dt className="text-gray-500 dark:text-gray-400">
                    {t("accountRecurrentTransfersCard.failures")}
                  </dt>
                  <dd
                    className={
                      failures > 0 ? "font-semibold text-red-500" : undefined
                    }
                  >
                    <span dir="ltr">
                      {failures.toLocaleString(locale)}
                      {maxFailures ? ` / ${maxFailures}` : ""}
                    </span>
                  </dd>
                  {transfer.memo && (
                    <>
                      <dt className="text-gray-500 dark:text-gray-400">
                        {t("accountRecurrentTransfersCard.memo")}
                      </dt>
                      <dd className="min-w-0 [overflow-wrap:anywhere]">
                        {transfer.memo}
                      </dd>
                    </>
                  )}
                </dl>
              </TableCell>
            </TableRow>
          )}
        </Fragment>
      );
    });

  const prepareExportData = () => {
    return sortedTransfers.map((transfer, index) => {
      const commonData = {
        [t("common.order")]: index + 1,
        [t("recurrentTransfersSort.Amount")]: transfer.amount,
        [t("recurrentTransfersSort.Recurrence")]: formatRecurrence(
          transfer.recurrence
        ),
        [t("recurrentTransfersSort.Remaining")]: transfer.remaining_executions,
        [t("accountRecurrentTransfersCard.nextExecution")]:
          formatBlockchainTime(transfer.trigger_date),
        [t("accountRecurrentTransfersCard.failures")]:
          transfer.consecutive_failures,
        [t("accountRecurrentTransfersCard.memo")]: transfer.memo,
      };
      if ("to" in transfer) {
        return {
          ...commonData,
          [t("recurrentTransfersSort.Recipient")]: transfer.to,
        };
      } else {
        return {
          ...commonData,
          [t("recurrentTransfersSort.Sender")]: transfer.from,
        };
      }
    });
  };

  const headerText = `${capitalizeFirst(t(`accountRecurrentTransfersCard.${direction}`))} ${t("accountRecurrentTransfersCard.recurrentTransfersHeader")}(${
    transfers.length
  })`;

  return (
    <Card
      data-testid="recurrent-transfers-dropdown"
      className="overflow-hidden"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between items-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{headerText}</div>
          <div className="flex items-center space-x-2">
            <DataExport
              data={prepareExportData()}
              filename={`${accountName}_${t(
                `accountRecurrentTransfersCard.${direction}`
              )}_${t(
                "accountRecurrentTransfersCard.recurrentTransfersExport"
              )}`}
              skipColumnSelection={true}
            />
            {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
          </div>
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
        <TooltipProvider>
          <Table>
            <TableHeader className="text-xs sm:text-sm">
              <TableRow>
                {buildTableHead(sortBy, key, isAscending, direction, t)}
                <TableHead className="w-px px-0" />
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs sm:text-sm">
              {buildTableBody(sortedTransfers)}
            </TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default AccountRecurrentTransfersCard;
