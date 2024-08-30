import React, { useState, Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import useRcDelegations from "@/api/common/useRcDelegations";
import { formatNumber } from "@/lib/utils";
type RcDelegation = {
  to: string;
  delegated_rc: number;
};

type AccountRcDelegationsCardProps = {
  delegatorAccount: string;
  limit: number;
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
}) => {
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);
  const { rcDelegationsData, isRcDelegationsLoading, isRcDelegationsError } =
    useRcDelegations(delegatorAccount, limit);

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

  return (
    <Card
      data-testid="rc-delegations-dropdown"
      className="overflow-hidden"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">RC Delegations</div>
          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
        <Table>
          <TableBody>{buildTableBody(delegations)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountRcDelegationsCard;
