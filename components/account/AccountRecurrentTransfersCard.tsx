import { useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "../ui/table";
import { capitalizeFirst } from "@/utils/StringUtils";
import {
  buildTableHead,
  handleSortTransfers,
} from "@/utils/RecurrentTransfersSort";
import Hive from "@/types/Hive";
import { useI18n } from "../../i18n/i18n";
import DataExport from "../DataExport";


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

const buildTableBody = (transfers: AllTransfers[]) => {
  return transfers.map((transfer, index: number) => {
    return (
      <Fragment key={index}>
        <TableRow>
          <TableCell>{index + 1}</TableCell>
          <TableCell className="text-right">
            {"to" in transfer ? (
              <Link
                className="text-link"
                href={`/@${transfer.to}`}
              >
                {transfer.to}
              </Link>
            ) : (
              <Link
                className="text-link"
                href={`/@${transfer.from}`}
              >
                {transfer.from}
              </Link>
            )}
          </TableCell>
          <TableCell className="text-right">{transfer.amount}</TableCell>
          <TableCell className="text-right">{transfer.recurrence}</TableCell>
          <TableCell className="text-right">
            {transfer.remaining_executions}
          </TableCell>
        </TableRow>
      </Fragment>
    );
  });
};

const AccountRecurrentTransfersCard: React.FC<
  AccountRecurrentTransfersCardProps
> = ({ direction, transfers, isInitiallyOpen, accountName }) => {
  const { t } = useI18n();
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(!isInitiallyOpen);
  const { hiveChain } = useHiveChainContext();

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

  const prepareExportData = () => {
    return sortedTransfers.map((transfer, index) => {
        const commonData = {
            [t("common.order")]: index + 1,
            [t("recurrentTransfersSort.Amount")]: transfer.amount,
            [t("recurrentTransfersSort.Recurrence")]: transfer.recurrence,
            [t("recurrentTransfersSort.Remaining")]: transfer.remaining_executions,
        };
        if ("to" in transfer) {
            return {
                ...commonData,
                [t("recurrentTransfersSort.Recipient")]: transfer.to
            };
        } else {
            return {
                ...commonData,
                [t("recurrentTransfersSort.Sender")]: transfer.from
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
        <Table>
          <TableHeader className="text-base">
            <TableRow>
              {buildTableHead(sortBy, key, isAscending, direction,t)}
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm">
            {buildTableBody(sortedTransfers)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountRecurrentTransfersCard;
