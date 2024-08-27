import { useState, Fragment, ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import { cn } from "@/lib/utils";
import useVestingDelegations from "@/api/common/useVestingDelegations";
import { convertVestsToHP } from "@/utils/Calculations";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/api/homePage/useDynamicGlobal";

type VestingDelegation = {
  delegatee: string;
  vesting_shares: string;
};

type AccountVestingDelegationsCardProps = {
  delegatorAccount: string;
  startAccount: string | null;
  limit: number;
};

const buildTableBody = (
  delegations: VestingDelegation[],
  formatHP: (vests: string) => ReactNode
) => {
  return delegations.map((delegation: VestingDelegation, index: number) => {
    const isLast = index === delegations.length - 1;

    return (
      <Fragment key={index}>
        <TableRow
          className={cn(
            {
              "border-t border-gray-700": index !== 0,
              "border-b border-gray-700": !isLast,
            },
            "hover:bg-inherit"
          )}
        >
          <TableCell>{index + 1}</TableCell>
          <TableCell className="text-right">
            <Link
              className="text-blue-400"
              href={`/@${delegation.delegatee}`}
            >
              {delegation.delegatee}
            </Link>
          </TableCell>
          <TableCell className="text-right">
            {formatHP(delegation.vesting_shares)}
          </TableCell>
        </TableRow>
      </Fragment>
    );
  });
};
const AccountVestingDelegationsCard: React.FC<
  AccountVestingDelegationsCardProps
> = ({ delegatorAccount, startAccount, limit }) => {
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();

  const { vestingDelegationsData: delegations } = useVestingDelegations(
    delegatorAccount,
    startAccount,
    limit
  );

  if (!hiveChain || !dynamicGlobalData || !delegations || !delegations.length)
    return;

  const {
    headBlockDetails: { totalVestingFundHive, totalVestingShares },
  } = dynamicGlobalData;

  const handlePropertiesVisibility = () => {
    setIsPropertiesHidden(!isPropertiesHidden);
  };

  const formatHP = (vests: string) => {
    const formattedHP = convertVestsToHP(
      hiveChain,
      vests,
      totalVestingFundHive,
      totalVestingShares
    );

    return formattedHP;
  };

  return (
    <Card
      data-testid="vesting-delegations-dropdown"
      className="overflow-hidden"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">HP Delegations</div>
          {isPropertiesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent hidden={isPropertiesHidden}>
        <Table>
          <TableBody>{buildTableBody(delegations, formatHP)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountVestingDelegationsCard;
