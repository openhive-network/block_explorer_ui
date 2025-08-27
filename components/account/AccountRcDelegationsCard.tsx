import React, { useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

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
  RcDelegation,
  buildTableHead,
  handleSortDelegations,
} from "@/utils/DelegationsSort";
import { useI18n } from "../../i18n/i18n";

type AccountRcDelegationsCardProps = {
  delegations?: RcDelegation[];
  isInitiallyOpen: boolean;
};

const buildTableBody = (delegations: RcDelegation[]) => {
  return delegations.map((delegation: RcDelegation, index: number) => {
    return (
      <Fragment key={index}>
        <TableRow>
          <TableCell>{index + 1}</TableCell>
          <TableCell className="text-right">
            <Link
              className="text-link"
              href={`/@${delegation.to}`}
            >
              {delegation.to}
            </Link>
          </TableCell>
          <TableCell className="text-right">
            {formatNumber(delegation.delegated_rc, false, true)}
          </TableCell>
        </TableRow>
      </Fragment>
    );
  });
};

const AccountRcDelegationsCard: React.FC<AccountRcDelegationsCardProps> = ({
  delegations,
  isInitiallyOpen,
}) => {
  const { t } = useI18n();
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(!isInitiallyOpen);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    isAscending: boolean;
  }>({
    key: "recipient",
    isAscending: true,
  });

  const { key, isAscending } = sortConfig;
  
  // If there's no data, render nothing.
  if (!delegations || !delegations.length) {
    return null;
  }

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };
  const sortBy = (key: string) => {
    setSortConfig({ key, isAscending: !isAscending });
  };

  const sortedDelegations = handleSortDelegations({
    delegations,
    key,
    isAscending,
    recipient: "to",
    amount: "delegated_rc",
  }) as RcDelegation[];

  return (
    <Card
      data-testid="rc-delegations-dropdown"
      className="overflow-hidden"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">
            {t("accountRcDelegationsCard.delegations")} ({delegations.length})
          </div>
          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
        <Table>
          <TableHeader className="text-base">
            <TableRow>{buildTableHead(sortBy, key, isAscending, t)}</TableRow>
          </TableHeader>
          <TableBody className="text-sm">
            {buildTableBody(sortedDelegations)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountRcDelegationsCard;
