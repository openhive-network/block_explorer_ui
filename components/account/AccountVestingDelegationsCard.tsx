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
import Explorer from "@/types/Explorer";
import useConvertedVestingShares from "@/hooks/common/useConvertedVestingShares";
import { buildTableHead, handleSortDelegations } from "@/utils/DelegationsSort";

type AccountVestingDelegationsCardProps = {
  delegatorAccount: string;
  liveDataEnabled: boolean;
  dynamicGlobalData?: Explorer.HeadBlockCardData;
};

const buildTableBody = (delegations: Explorer.VestingDelegation[]) => {
  return delegations.map((delegation, index: number) => {
    return (
      <Fragment key={index}>
        <TableRow className={"border-b border-gray-700 hover:bg-inherit"}>
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
            {delegation.vesting_shares}
          </TableCell>
        </TableRow>
      </Fragment>
    );
  });
};
const AccountVestingDelegationsCard: React.FC<
  AccountVestingDelegationsCardProps
> = ({ delegatorAccount, liveDataEnabled, dynamicGlobalData }) => {
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(true);
  const { hiveChain } = useHiveChainContext();
  const delegations = useConvertedVestingShares(
    delegatorAccount,
    liveDataEnabled,
    dynamicGlobalData
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    isAscending: boolean;
  }>({
    key: "recipient",
    isAscending: true,
  });

  const { key, isAscending } = sortConfig;

  if (!hiveChain || !dynamicGlobalData || !delegations || !delegations.length)
    return;

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
    recipient: "delegatee",
    amount: "vesting_shares",
  }) as Explorer.VestingDelegation[];

  return (
    <Card
      data-testid="vesting-delegations-dropdown"
      className="overflow-hidden"
    >
      <CardHeader className="p-0">
        <div
          onClick={handlePropertiesVisibility}
          className="h-full flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">HP Delegations ({delegations.length})</div>
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

export default AccountVestingDelegationsCard;
