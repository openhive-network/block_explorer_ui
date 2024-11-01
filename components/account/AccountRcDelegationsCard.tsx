import React, { useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

import { formatNumber } from "@/lib/utils";
import useRcDelegations from "@/hooks/api/common/useRcDelegations";
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

type AccountRcDelegationsCardProps = {
  delegatorAccount: string;
  limit: number;
  liveDataEnabled: boolean;
};

const buildTableBody = (delegations: RcDelegation[]) => {
  return delegations.map((delegation: RcDelegation, index: number) => {
    const isLast = index === delegations.length - 1;
    return (
      <Fragment key={index}>
        <TableRow className={"border-b border-gray-700 hover:bg-inherit"}>
          <TableCell>{index + 1}</TableCell>
          <TableCell className="text-right">
            <Link
              className="text-blue-400"
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
  delegatorAccount,
  limit,
  liveDataEnabled,
}) => {
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);
  const { rcDelegationsData, isRcDelegationsLoading, isRcDelegationsError } =
    useRcDelegations(delegatorAccount, limit, liveDataEnabled);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    isAscending: boolean;
  }>({
    key: "recipient",
    isAscending: true,
  });

  const { key, isAscending } = sortConfig;

  if (isRcDelegationsLoading) {
    return <div></div>;
  }

  if (isRcDelegationsError) {
    return <div></div>;
  }

  const delegations = rcDelegationsData;
  if (!delegations?.length) return <div className="text-black"></div>;

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
          <div className="text-lg">RC Delegations ({delegations.length})</div>
          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
        <Table>
          <TableHeader>
            <TableRow>{buildTableHead(sortBy, key, isAscending)}</TableRow>
          </TableHeader>
          <TableBody>{buildTableBody(sortedDelegations)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountRcDelegationsCard;
