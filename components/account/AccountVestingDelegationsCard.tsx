import { useState, Fragment, useEffect } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "../ui/table";
import Explorer from "@/types/Explorer";
import { buildTableHead, handleSortDelegations } from "@/utils/DelegationsSort";
import { capitalizeFirst } from "@/utils/StringUtils";
import { useI18n } from "../../i18n/i18n";
import DataExport from "../DataExport";

type AccountVestingDelegationsCardProps = {
  id?: string;
  direction: "incoming" | "outgoing";
  delegations?: Explorer.VestingDelegation[]; // Data is now a prop
  dynamicGlobalData?: Explorer.HeadBlockCardData;
  isInitiallyOpen: boolean;
  forceOpen?: boolean;
  accountName: string;
};

const buildTableBody = (
  direction: "outgoing" | "incoming",
  delegations: Explorer.VestingDelegation[]
) => {
  return delegations.map((delegation, index: number) => {
    return (
      <Fragment key={index}>
        <TableRow>
          <TableCell>{index + 1}</TableCell>
          <TableCell className="text-right">
            {direction === "outgoing" ? (
              <Link
                className="text-link"
                href={`/@${delegation.delegatee}`}
              >
                {delegation.delegatee}
              </Link>
            ) : (
              <Link
                className="text-link"
                href={`/@${delegation.delegator}`}
              >
                {delegation.delegator}
              </Link>
            )}
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
> = ({
  id,
  direction,
  delegations,
  dynamicGlobalData,
  isInitiallyOpen,
  accountName,
  forceOpen = false,
}) => {
  const { t } = useI18n();
  const [isPropertiesHidden, setIsPropertiesHidden] = useState(
    !isInitiallyOpen
  );

  useEffect(() => {
    if (forceOpen) {
      setIsPropertiesHidden(false);
    }
  }, [forceOpen]);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    isAscending: boolean;
  }>({
    key: direction === "outgoing" ? "recipient" : "delegator",
    isAscending: true,
  });

  const { key, isAscending } = sortConfig;

  // If there's no data, or the dynamic global data isn't ready, render nothing.
  if (!dynamicGlobalData || !delegations || !delegations.length) {
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
    recipient: direction === "outgoing" ? "delegatee" : "delegator",
    amount: "vesting_shares",
  }) as Explorer.VestingDelegation[];

  const prepareExportData = () => {
    return sortedDelegations.map((delegation, index) => {
      return {
        [t("common.order")]: index + 1,
        [direction === "outgoing"
          ? t("delegationSort.Recipient")
          : t("delegationSort.Delegator")]:
          direction === "outgoing"
            ? delegation.delegatee
            : delegation.delegator,
        [t("delegationSort.Amount")]: delegation.vesting_shares,
      };
    });
  };

  const headerText = `${capitalizeFirst(
    t(`accountVestingDelegationsCard.${direction}`)
  )} ${t("accountVestingDelegationsCard.hpDelegations")}(${
    delegations.length
  })`;

  return (
    <Card
      id={id}
      data-testid="vesting-delegations-dropdown"
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
                `accountVestingDelegationsCard.${direction}`
              )}_${t("accountVestingDelegationsCard.hpDelegationsExport")}`}
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
              {buildTableHead(sortBy, key, isAscending, t, direction)}
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm">
            {buildTableBody(direction, sortedDelegations)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AccountVestingDelegationsCard;
