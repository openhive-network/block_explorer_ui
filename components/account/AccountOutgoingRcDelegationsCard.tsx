import React, { useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import { formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/table";
import {
  OutgoingRcDelegation,
  buildTableHead,
  handleSortDelegations,
} from "@/utils/DelegationsSort";
import { useI18n } from "../../i18n/i18n";
import DataExport from "../DataExport";
import CustomPagination from "../CustomPagination";
import { config } from "@/Config";

const PAGE_SIZE = config.standardPaginationSize;

type AccountOutgoingRcDelegationsCardProps = {
  delegations?: OutgoingRcDelegation[];
  isInitiallyOpen: boolean;
  accountName: string;
};

const buildTableBody = (
  delegations: OutgoingRcDelegation[],
  onRowClick: (blockNum: number, operationId: string) => void,
  offset: number = 0
) => {
  return delegations.map((delegation: OutgoingRcDelegation, index: number) => {
    return (
      <Fragment key={index}>
        <TableRow
          className="cursor-pointer hover:bg-rowHover"
          onClick={() => onRowClick(delegation.block_num, delegation.operation_id)}
        >
          <TableCell>{offset + index + 1}</TableCell>
          <TableCell className="text-right break-words">
            <Link
              className="text-link"
              href={`/@${delegation.delegatee}`}
              onClick={(e) => e.stopPropagation()}
            >
              {delegation.delegatee}
            </Link>
          </TableCell>
          <TableCell className="text-right break-words">
            {formatNumber(delegation.max_rc, false, true, 0)}
          </TableCell>
        </TableRow>
      </Fragment>
    );
  });
};

const AccountOutgoingRcDelegationsCard: React.FC<AccountOutgoingRcDelegationsCardProps> = ({
  delegations,
  isInitiallyOpen,
  accountName,
}) => {
  const { t } = useI18n();
  const router = useRouter();
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(!isInitiallyOpen);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    isAscending: boolean;
  }>({
    key: "recipient",
    isAscending: true,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { key, isAscending } = sortConfig;

  if (!delegations || !delegations.length) {
    return null;
  }

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };
  const sortBy = (key: string) => {
    setSortConfig({ key, isAscending: !isAscending });
    setCurrentPage(1);
  };

  const handleRowClick = (blockNum: number, operationId: string) => {
    const params = new URLSearchParams();
    params.append("opId", operationId);
    router.push(`/block/${blockNum}?${params.toString()}`);
  };

  const sortedDelegations = handleSortDelegations({
    delegations,
    key,
    isAscending,
    recipient: "delegatee",
    amount: "max_rc",
  }) as OutgoingRcDelegation[];

  const pagedDelegations = sortedDelegations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const prepareExportData = () => {
    return sortedDelegations.map((delegation, index) => {
      return {
        [t("common.order")]: index + 1,
        [t("delegationSort.Recipient")]: delegation.delegatee,
        [t("delegationSort.Amount")]: formatNumber(delegation.max_rc, false, true, 0),
      };
    });
  };

  return (
    <Card
      data-testid="outgoing-rc-delegations-dropdown"
      className="overflow-hidden"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">
            {t("accountOutgoingRcDelegationsCard.delegations")} ({delegations.length})
          </div>
          <div className="flex items-center space-x-2">
            <DataExport
              data={prepareExportData()}
              filename={`${accountName}_${t(
                "accountOutgoingRcDelegationsCard.delegationsExport"
              )}.csv`}
              skipColumnSelection={true}
            />
            {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
          </div>
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
        <Table className="table-fixed">
          <TableHeader className="text-base">
            <TableRow>{buildTableHead(sortBy, key, isAscending, t, "outgoing")}</TableRow>
          </TableHeader>
          <TableBody className="text-sm">
            {buildTableBody(pagedDelegations, handleRowClick, (currentPage - 1) * PAGE_SIZE)}
          </TableBody>
        </Table>
        <CustomPagination
          currentPage={currentPage}
          totalCount={sortedDelegations.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </CardContent>
    </Card>
  );
};

export default AccountOutgoingRcDelegationsCard;
